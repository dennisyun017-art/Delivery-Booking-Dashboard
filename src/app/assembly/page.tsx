import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatTile from "@/components/StatTile";
import DeliveryRow, { ROW_GRID } from "@/components/DeliveryRow";
import { findConflictingIds } from "@/lib/conflicts";
import type { Delivery } from "@/lib/types";

// Format using local date components, not toISOString() (which converts to
// UTC and shifts the date by a day in timezones ahead of UTC, e.g. KST).
function dateOnly(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dateOnly(d);
}

export default async function AssemblyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const day = date || dateOnly(new Date());

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("conflict_buffer_minutes")
    .eq("id", user!.id)
    .single();

  const start = new Date(day + "T00:00:00").toISOString();
  const end = new Date(day + "T23:59:59.999").toISOString();

  const [{ data: deliveryCompanies }, { data: deliveries }] = await Promise.all([
    supabase.from("profiles").select("id, company_name").eq("role", "delivery"),
    supabase
      .from("deliveries")
      .select("*")
      .eq("assembly_company_id", user!.id)
      .gte("requested_at", start)
      .lte("requested_at", end)
      .order("requested_at", { ascending: true }),
  ]);

  const companyMap = new Map((deliveryCompanies ?? []).map((c) => [c.id, c.company_name]));
  const bufferMinutes = myProfile?.conflict_buffer_minutes ?? 15;
  const rows = (deliveries ?? []) as Delivery[];
  const conflicts = findConflictingIds(rows, bufferMinutes);

  const counts = {
    total: rows.length,
    pending: rows.filter((d) => d.status === "pending").length,
    approved: rows.filter((d) => d.status === "approved").length,
    rejected: rows.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/assembly?date=${addDays(day, -1)}`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
        >
          ◀ 이전
        </Link>
        <div className="text-center">
          <p className="font-semibold text-slate-800">{day}</p>
          <p className="text-xs text-slate-400">겹침 기준 {bufferMinutes}분</p>
        </div>
        <Link
          href={`/assembly?date=${addDays(day, 1)}`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
        >
          다음 ▶
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="총 예약" value={counts.total} />
        <StatTile label="대기중" value={counts.pending} accent="amber" />
        <StatTile label="승인됨" value={counts.approved} accent="green" />
        <StatTile label="반려됨" value={counts.rejected} accent="red" />
      </div>

      {conflicts.size > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          ⚠️ {conflicts.size}건이 다른 예약과 {bufferMinutes}분 이내로 겹칩니다.
        </p>
      )}

      <div className="rounded-xl border border-slate-100 bg-white px-3 shadow-[0_1px_2px_rgb(0,0,0,0.04)] md:px-4">
        <div
          className={`hidden border-b border-slate-100 py-2 text-xs font-medium text-slate-400 md:grid md:items-center ${ROW_GRID}`}
        >
          <span>시간</span>
          <span>납품사</span>
          <span>LOT</span>
          <span>W/O</span>
          <span>상태</span>
          <span className="text-right">액션</span>
        </div>

        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            이 날짜에 등록된 예약이 없습니다.
          </p>
        )}

        {rows.map((d) => (
          <DeliveryRow
            key={d.id}
            delivery={d}
            companyName={companyMap.get(d.delivery_company_id) ?? "알 수 없음"}
            isConflict={conflicts.has(d.id)}
            bufferMinutes={bufferMinutes}
          />
        ))}
      </div>
    </div>
  );
}
