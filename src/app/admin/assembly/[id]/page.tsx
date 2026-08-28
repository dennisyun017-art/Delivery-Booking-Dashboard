import { createAdminClient } from "@/lib/supabase/admin";
import { loadAssemblyDashboardData } from "@/lib/assembly-dashboard-data";
import { addMonths } from "@/lib/date";
import AssemblyDashboardClient from "@/components/AssemblyDashboardClient";
import AssemblyCompanySwitcher from "@/components/AssemblyCompanySwitcher";

export default async function AdminAssemblyViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ center?: string }>;
}) {
  const { id } = await params;
  const { center } = await searchParams;

  const admin = createAdminClient();

  const [{ data: allAssembly }, { data: viewedProfile }, dashboard] = await Promise.all([
    admin.from("profiles").select("id, company_name").eq("role", "assembly").order("company_name"),
    admin.from("profiles").select("company_name").eq("id", id).single(),
    loadAssemblyDashboardData(admin, id, center),
  ]);

  if (!viewedProfile) {
    return <p className="text-sm text-slate-400">존재하지 않는 회사입니다.</p>;
  }

  const { today, gridCenter, calendarDates, bufferMinutes, rows } = dashboard;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div>
          <p className="text-xs font-medium text-amber-700">관리자 보기 (읽기 전용)</p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{viewedProfile.company_name}</span>가 보는 화면과
            동일합니다. 승인/반려는 여기서 할 수 없습니다.
          </p>
        </div>
        <AssemblyCompanySwitcher companies={allAssembly ?? []} currentId={id} />
      </div>

      <AssemblyDashboardClient
        deliveries={rows}
        calendarDates={calendarDates}
        today={today}
        bufferMinutes={bufferMinutes}
        focusMonth={gridCenter}
        prevHref={`/admin/assembly/${id}?center=${addMonths(gridCenter, -1)}`}
        nextHref={`/admin/assembly/${id}?center=${addMonths(gridCenter, 1)}`}
        readOnly
      />
    </div>
  );
}
