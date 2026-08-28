import { createClient } from "@/lib/supabase/server";
import AssemblyDashboardClient from "@/components/AssemblyDashboardClient";
import { loadAssemblyDashboardData } from "@/lib/assembly-dashboard-data";
import { addMonths } from "@/lib/date";

export default async function AssemblyPage({
  searchParams,
}: {
  searchParams: Promise<{ center?: string }>;
}) {
  const { center } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { today, gridCenter, calendarDates, bufferMinutes, rows } = await loadAssemblyDashboardData(
    supabase,
    user!.id,
    center,
  );

  return (
    <AssemblyDashboardClient
      deliveries={rows}
      calendarDates={calendarDates}
      today={today}
      bufferMinutes={bufferMinutes}
      focusMonth={gridCenter}
      prevHref={`/assembly?center=${addMonths(gridCenter, -1)}`}
      nextHref={`/assembly?center=${addMonths(gridCenter, 1)}`}
    />
  );
}
