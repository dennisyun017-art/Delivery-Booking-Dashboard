"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const companyName = String(formData.get("company_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const businessDesc = String(formData.get("business_desc") || "").trim() || null;
  // Public signup is delivery-company only — assembly (and admin) accounts
  // are provisioned by an admin via email invite. See src/app/admin.
  const role = "delivery" as const;

  if (!email || !password || !companyName) {
    redirect("/signup?error=" + encodeURIComponent("모든 항목을 입력해주세요."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect("/signup?error=" + encodeURIComponent(error?.message || "회원가입에 실패했습니다."));
  }

  if (!data.session) {
    // Supabase project has "Confirm email" turned on, so there's no active
    // session yet to create the profile row under RLS. See README setup
    // instructions — for this internal tool we recommend turning it off.
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "이메일 인증이 필요합니다. 관리자에게 문의하거나 Supabase 프로젝트의 이메일 인증 설정을 확인해주세요.",
        ),
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user!.id,
    company_name: companyName,
    role,
    phone,
    business_desc: businessDesc,
  });

  if (profileError) {
    // Clean up the just-created auth user so the email isn't stuck
    // "already registered" on a retry — most likely to happen now via the
    // company_name_key unique constraint (duplicate/near-duplicate name).
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(data.user!.id);

    const message =
      profileError.code === "23505"
        ? "이미 등록된 회사명과 겹칩니다(띄어쓰기·(주) 표기 차이 포함). 다른 이름을 사용해주세요."
        : profileError.message;
    redirect("/signup?error=" + encodeURIComponent(message));
  }

  redirect("/delivery");
}
