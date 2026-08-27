"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email";

export async function createDelivery(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const assemblyCompanyId = String(formData.get("assembly_company_id") || "");
  const requestedAt = String(formData.get("requested_at") || "");
  const lotNo = String(formData.get("lot_no") || "").trim();
  const woNo = String(formData.get("wo_no") || "").trim();
  const contactPhone = String(formData.get("contact_phone") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  if (!assemblyCompanyId || !requestedAt || !lotNo || !woNo) {
    throw new Error("assembly 회사, 도착 예정 시간, LOT, W/O를 입력해주세요.");
  }

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      assembly_company_id: assemblyCompanyId,
      requested_at: new Date(requestedAt).toISOString(),
      lot_no: lotNo,
      wo_no: woNo,
      contact_phone: contactPhone,
      note,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Best-effort notification — a failure here must not undo the booking.
  try {
    const admin = createAdminClient();
    const [{ data: authUser }, { data: myProfile }] = await Promise.all([
      admin.auth.admin.getUserById(assemblyCompanyId),
      supabase.from("profiles").select("company_name").eq("id", user.id).single(),
    ]);

    if (authUser.user?.email) {
      await sendMail(
        authUser.user.email,
        "[납품예약] 새 납품 예약이 등록되었습니다",
        `<p><b>${myProfile?.company_name ?? "납품 업체"}</b>에서 새 납품 예약을 등록했습니다.</p>
         <p>예상 도착 시간: ${new Date(delivery.requested_at).toLocaleString("ko-KR")}</p>
         <p>LOT: ${lotNo} / W/O: ${woNo}</p>
         <p>대시보드에서 확인 후 승인/반려해주세요.</p>`,
      );
    }
  } catch (e) {
    console.error("[notify] failed to notify assembly company", e);
  }

  revalidatePath("/delivery");
}

export async function resubmitDelivery(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const id = String(formData.get("id") || "");
  const requestedAt = String(formData.get("requested_at") || "");
  const lotNo = String(formData.get("lot_no") || "").trim();
  const woNo = String(formData.get("wo_no") || "").trim();
  const contactPhone = String(formData.get("contact_phone") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  if (!id || !requestedAt || !lotNo || !woNo) {
    throw new Error("도착 예정 시간, LOT, W/O를 입력해주세요.");
  }

  const { error } = await supabase
    .from("deliveries")
    .update({
      requested_at: new Date(requestedAt).toISOString(),
      lot_no: lotNo,
      wo_no: woNo,
      contact_phone: contactPhone,
      note,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}
