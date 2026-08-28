import type { SupabaseClient } from "@supabase/supabase-js";
import { buildThreeWeekGrid, dateOnly } from "@/lib/date";
import type { Delivery, DeliveryWithCompany } from "@/lib/types";

/**
 * Loads everything the assembly dashboard needs for one assembly company.
 * Shared by the real /assembly page (called with the signed-in user's own
 * id, via the RLS-respecting server client) and the admin's read-only
 * cross-company view at /admin/assembly/[id] (called with any company's
 * id, via the service-role client, since RLS would otherwise block admin
 * from reading another company's bookings).
 */
export async function loadAssemblyDashboardData(
  // Accepts either the regular server client or the admin/service-role
  // client; their generated types don't unify cleanly, and both expose
  // the same `.from()` surface used here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  assemblyCompanyId: string,
  center?: string,
) {
  const today = dateOnly(new Date());
  const gridCenter = center || today;
  const calendarDates = buildThreeWeekGrid(gridCenter);
  const rangeStart = new Date(calendarDates[0] + "T00:00:00").toISOString();
  const rangeEnd = new Date(calendarDates[calendarDates.length - 1] + "T23:59:59.999").toISOString();

  const [{ data: myProfile }, { data: deliveryCompanies }, { data: deliveries }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("conflict_buffer_minutes")
        .eq("id", assemblyCompanyId)
        .single(),
      supabase.from("profiles").select("id, company_name").eq("role", "delivery"),
      supabase
        .from("deliveries")
        .select("*")
        .eq("assembly_company_id", assemblyCompanyId)
        .gte("requested_at", rangeStart)
        .lte("requested_at", rangeEnd)
        .order("requested_at", { ascending: true }),
    ]);

  const companyMap = new Map(
    (deliveryCompanies ?? []).map((c: { id: string; company_name: string }) => [c.id, c.company_name]),
  );
  const bufferMinutes = myProfile?.conflict_buffer_minutes ?? 15;

  const rows: DeliveryWithCompany[] = ((deliveries ?? []) as Delivery[]).map((d) => ({
    ...d,
    company_name: companyMap.get(d.delivery_company_id) ?? "알 수 없음",
  }));

  return { today, gridCenter, calendarDates, bufferMinutes, rows };
}
