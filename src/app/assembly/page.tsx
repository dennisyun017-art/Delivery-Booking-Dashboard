import { createClient } from "@/lib/supabase/server";
import AssemblyDashboardClient from "@/components/AssemblyDashboardClient";
import { buildThreeWeekGrid, dateOnly } from "@/lib/date";
import type { Delivery, DeliveryWithCompany } from "@/lib/types";

export default async function AssemblyPage() {
  const today = dateOnly(new Date());
  const calendarDates = buildThreeWeekGrid(today);
  const rangeStart = new Date(calendarDates[0] + "T00:00:00").toISOString();
  const rangeEnd = new Date(calendarDates[calendarDates.length - 1] + "T23:59:59.999").toISOString();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: myProfile }, { data: deliveryCompanies }, { data: deliveries }] =
    await Promise.all([
      supabase.from("profiles").select("conflict_buffer_minutes").eq("id", user!.id).single(),
      supabase.from("profiles").select("id, company_name").eq("role", "delivery"),
      supabase
        .from("deliveries")
        .select("*")
        .eq("assembly_company_id", user!.id)
        .gte("requested_at", rangeStart)
        .lte("requested_at", rangeEnd)
        .order("requested_at", { ascending: true }),
    ]);

  const companyMap = new Map((deliveryCompanies ?? []).map((c) => [c.id, c.company_name]));
  const bufferMinutes = myProfile?.conflict_buffer_minutes ?? 15;

  const rows: DeliveryWithCompany[] = ((deliveries ?? []) as Delivery[]).map((d) => ({
    ...d,
    company_name: companyMap.get(d.delivery_company_id) ?? "알 수 없음",
  }));

  return (
    <AssemblyDashboardClient
      deliveries={rows}
      calendarDates={calendarDates}
      today={today}
      bufferMinutes={bufferMinutes}
    />
  );
}
