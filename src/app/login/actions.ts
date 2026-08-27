"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("이메일과 비밀번호를 입력해주세요."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(
      "/login?error=" + encodeURIComponent("이메일 또는 비밀번호가 올바르지 않습니다."),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user!.id)
    .single();

  redirect(profile?.role === "assembly" ? "/assembly" : "/delivery");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
