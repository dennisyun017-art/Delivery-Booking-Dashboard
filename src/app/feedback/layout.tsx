import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContactEmail } from "@/lib/admin-contact";
import Nav from "@/components/Nav";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  assembly: "Assembly BP사",
  delivery: "납품 BP사",
  admin: "관리자",
};

const ROLE_HOME: Record<Role, string> = {
  assembly: "/assembly",
  delivery: "/delivery",
  admin: "/admin",
};

export default async function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, adminEmail] = await Promise.all([
    supabase.from("profiles").select("role, company_name").eq("id", user.id).single(),
    getAdminContactEmail(),
  ]);
  if (!profile) redirect("/login");

  const role = profile.role as Role;

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav
        companyName={profile.company_name}
        roleLabel={ROLE_LABEL[role]}
        adminEmail={role !== "admin" ? adminEmail : undefined}
        links={[{ href: ROLE_HOME[role], label: "대시보드로" }]}
      />
      <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
    </div>
  );
}
