import { createClient } from "@/lib/supabase/server";
import AssemblyDashboardClient from "@/components/AssemblyDashboardClient";
import { loadAssemblyDashboardData } from "@/lib/assembly-dashboard-data";
import { addDays } from "@/lib/date";

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
      prevHref={`/assembly?center=${addDays(gridCenter, -7)}`}
      nextHref={`/assembly?center=${addDays(gridCenter, 7)}`}
    />
  );
}
