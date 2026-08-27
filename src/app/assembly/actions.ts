"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email";

async function decide(id: string, status: "approved" | "rejected", rejectReason?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .update({
      status,
      reject_reason: status === "rejected" ? rejectReason || "" : null,
    })
    .eq("id", id)
    .select("delivery_company_id, requested_at")
    .single();

  if (error) throw new Error(error.message);

  try {
    const admin = createAdminClient();
    const [{ data: authUser }, { data: myProfile }] = await Promise.all([
      admin.auth.admin.getUserById(delivery.delivery_company_id),
      supabase.from("profiles").select("company_name").eq("id", user.id).single(),
    ]);

    if (authUser.user?.email) {
      const when = new Date(delivery.requested_at).toLocaleString("ko-KR");
      const company = myProfile?.company_name ?? "Assembly 업체";
      const html =
        status === "approved"
          ? `<p><b>${company}</b>가 ${when} 납품 예약을 <b>승인</b>했습니다.</p>`
          : `<p><b>${company}</b>가 ${when} 납품 예약을 <b>반려</b>했습니다.</p>
             <p>사유: ${rejectReason || "(사유 없음)"}</p>
             <p>대시보드에서 시간을 재입력해주세요.</p>`;

      await sendMail(
        authUser.user.email,
        `[납품예약] 예약이 ${status === "approved" ? "승인" : "반려"}되었습니다`,
        html,
      );
    }
  } catch (e) {
    console.error("[notify] failed to notify delivery company", e);
  }

  revalidatePath("/assembly");
}

export async function approveDelivery(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("잘못된 요청입니다.");
  await decide(id, "approved");
}

export async function rejectDelivery(formData: FormData) {
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!id) throw new Error("잘못된 요청입니다.");
  if (!reason) throw new Error("반려 사유를 입력해주세요.");
  await decide(id, "rejected", reason);
}

export async function updateConflictBuffer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const minutes = Number(formData.get("conflict_buffer_minutes"));
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error("올바른 분 단위 숫자를 입력해주세요.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ conflict_buffer_minutes: minutes })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/assembly/settings");
  revalidatePath("/assembly");
}
