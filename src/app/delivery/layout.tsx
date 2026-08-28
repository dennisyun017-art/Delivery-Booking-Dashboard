import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContactEmail } from "@/lib/admin-contact";
import Nav from "@/components/Nav";

export default async function DeliveryLayout({
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

  if (profile?.role !== "delivery") redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav
        companyName={profile.company_name}
        roleLabel="납품 BP사"
        adminEmail={adminEmail}
        links={[
          { href: "/account", label: "비밀번호 변경" },
          { href: "/feedback", label: "문의하기" },
        ]}
      />
      <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
    </div>
  );
}
