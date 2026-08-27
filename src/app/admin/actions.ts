"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function inviteAssemblyCompany(formData: FormData) {
  await requireAdmin();

  const companyName = String(formData.get("company_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  if (!companyName || !email) throw new Error("회사명과 이메일을 입력해주세요.");

  // Privileged client — inviteUserByEmail and writing another company's
  // profile row both require bypassing RLS, which only the service-role
  // key can do. Never expose this path to non-admins (requireAdmin above).
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/set-password`,
    data: { company_name: companyName },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "초대 이메일 발송에 실패했습니다.");
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    company_name: companyName,
    role: "assembly",
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  revalidatePath("/admin");
}
