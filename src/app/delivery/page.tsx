import { createClient } from "@/lib/supabase/server";
import NewDeliveryForm from "@/components/NewDeliveryForm";
import MyDeliveriesList from "@/components/MyDeliveriesList";
import type { Delivery } from "@/lib/types";

export default async function DeliveryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: assemblyCompanies }, { data: deliveries }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, company_name, business_desc")
      .eq("role", "assembly")
      .order("company_name"),
    supabase
      .from("deliveries")
      .select("*")
      .eq("delivery_company_id", user!.id)
      .order("requested_at", { ascending: false }),
  ]);

  const assemblyMap = new Map((assemblyCompanies ?? []).map((c) => [c.id, c.company_name]));

  const rows = ((deliveries ?? []) as Delivery[]).map((d) => ({
    ...d,
    assembly_company_name: assemblyMap.get(d.assembly_company_id) ?? "알 수 없음",
  }));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">새 납품 예약</h2>
        <NewDeliveryForm assemblyCompanies={assemblyCompanies ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">내 예약 목록</h2>
        <MyDeliveriesList deliveries={rows} />
      </section>
    </div>
  );
}
