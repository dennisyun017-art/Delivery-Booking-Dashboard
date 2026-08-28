"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedbackStatus } from "@/lib/types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("관리자만 사용할 수 있습니다.");
}

const VALID_STATUSES: FeedbackStatus[] = ["open", "answered", "resolved"];

export async function replyToFeedback(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const reply = String(formData.get("admin_reply") || "").trim();
  const status = String(formData.get("status") || "");
  if (!id) throw new Error("잘못된 요청입니다.");
  if (!VALID_STATUSES.includes(status as FeedbackStatus)) throw new Error("잘못된 상태입니다.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("feedback")
    .update({
      admin_reply: reply || null,
      status,
      replied_at: reply ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/feedback");
  revalidatePath("/feedback");
}
