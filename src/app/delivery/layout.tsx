import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "delivery") redirect("/assembly");

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav companyName={profile.company_name} roleLabel="납품 BP사" />
      <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
    </div>
  );
}
