import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav companyName={profile.company_name} roleLabel="관리자" maxWidthClassName="max-w-5xl" />
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
