"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Excludes visually ambiguous characters (0/O, 1/l/I) since this is meant
// to be read aloud or typed from a phone/KakaoTalk message.
const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateTempPassword(length = 10): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => TEMP_PASSWORD_CHARS[b % TEMP_PASSWORD_CHARS.length]).join("");
}

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

/**
 * Supabase admin calls occasionally throw a raw exception instead of
 * returning `{ error }` (e.g. when the configured SMTP provider itself
 * fails). Left uncaught, Next.js redacts that in production down to a
 * generic "Minified React error #441" with no useful message. Wrapping
 * every admin-API call through this turns it into a normal thrown Error
 * with a real message, which Server Actions do pass through to the client.
 */
async function callAdminApi<T>(fn: () => Promise<T>, fallbackMessage: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : fallbackMessage);
  }
}

/** Postgres unique_violation on profiles.company_name_key → a friendly
 * message instead of the raw constraint error. */
function friendlyProfileError(error: { code?: string; message: string }): string {
  return error.code === "23505"
    ? "이미 등록된 회사명과 겹칩니다(띄어쓰기·(주) 표기 차이 포함). 다른 이름을 사용해주세요."
    : error.message;
}

export async function inviteAssemblyCompany(formData: FormData) {
  await requireAdmin();

  const companyName = String(formData.get("company_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const businessDesc = String(formData.get("business_desc") || "").trim() || null;
  if (!companyName || !email) throw new Error("회사명과 이메일을 입력해주세요.");

  // Privileged client — inviteUserByEmail and writing another company's
  // profile row both require bypassing RLS, which only the service-role
  // key can do. Never expose this path to non-admins (requireAdmin above).
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await callAdminApi(
    () =>
      admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/set-password`,
        data: { company_name: companyName },
      }),
    "초대 이메일 발송 중 오류가 발생했습니다.",
  );

  if (error || !data.user) {
    const message = error?.message ?? "초대 이메일 발송에 실패했습니다.";
    throw new Error(
      /already.*registered|already.*exists/i.test(message)
        ? "이미 등록된 이메일입니다. 아래 목록에서 기존 항목을 삭제한 뒤 다시 초대해주세요."
        : message,
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    company_name: companyName,
    role: "assembly",
    phone,
    business_desc: businessDesc,
  });

  if (profileError) {
    // Don't leave a profile-less auth user behind (e.g. blocks re-inviting
    // this email later with "already registered").
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(friendlyProfileError(profileError));
  }

  revalidatePath("/admin");
}

/**
 * Creates the assembly company's account immediately with a generated
 * temporary password, instead of sending an invite email. The admin is
 * responsible for relaying company/email/password to the company out of
 * band (phone, KakaoTalk, etc.) — nothing is emailed.
 */
export async function createAssemblyCompanyDirect(
  formData: FormData,
): Promise<{ tempPassword: string }> {
  await requireAdmin();

  const companyName = String(formData.get("company_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const businessDesc = String(formData.get("business_desc") || "").trim() || null;
  if (!companyName || !email) throw new Error("회사명과 이메일을 입력해주세요.");

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { data, error } = await callAdminApi(
    () =>
      admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // no verification email — the temp password IS the credential
      }),
    "계정 생성 중 오류가 발생했습니다.",
  );

  if (error || !data.user) {
    const message = error?.message ?? "계정 생성에 실패했습니다.";
    throw new Error(
      /already.*registered|already.*exists/i.test(message)
        ? "이미 등록된 이메일입니다. 아래 목록에서 기존 항목을 삭제한 뒤 다시 만들어주세요."
        : message,
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    company_name: companyName,
    role: "assembly",
    phone,
    business_desc: businessDesc,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(friendlyProfileError(profileError));
  }

  revalidatePath("/admin");
  return { tempPassword };
}

/** Deletes an assembly company's account entirely (auth user + profile row,
 * which cascades). Fails on purpose if the company already has delivery
 * records — those would otherwise be orphaned. */
export async function deleteAssemblyCompany(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("잘못된 요청입니다.");

  const admin = createAdminClient();

  const { error } = await callAdminApi(
    () => admin.auth.admin.deleteUser(id),
    "삭제 중 오류가 발생했습니다.",
  );

  if (error) {
    throw new Error(
      /foreign key|violates/i.test(error.message)
        ? "이 회사와 연결된 납품 예약 기록이 있어 삭제할 수 없습니다."
        : error.message,
    );
  }

  revalidatePath("/admin");
}

/** Renames any company (assembly or delivery) — for fixing typos or
 * near-duplicate names (e.g. "현대모비스" vs "현대 모비스") from one
 * overview screen instead of hunting through signups. */
export async function updateCompanyName(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const companyName = String(formData.get("company_name") || "").trim();
  if (!id || !companyName) throw new Error("회사명을 입력해주세요.");

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ company_name: companyName }).eq("id", id);

  if (error) {
    throw new Error(friendlyProfileError(error));
  }

  revalidatePath("/admin/companies");
}

/** Resets any company's (assembly or delivery) password to a freshly
 * generated one — for when a company forgets theirs. The admin relays the
 * new password out of band (phone, KakaoTalk); it's shown once and never
 * stored or logged in the clear. */
export async function resetCompanyPassword(formData: FormData): Promise<{ tempPassword: string }> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("잘못된 요청입니다.");

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { error } = await callAdminApi(
    () => admin.auth.admin.updateUserById(id, { password: tempPassword }),
    "비밀번호 초기화 중 오류가 발생했습니다.",
  );

  if (error) throw new Error(error.message);

  revalidatePath("/admin/companies");
  return { tempPassword };
}
