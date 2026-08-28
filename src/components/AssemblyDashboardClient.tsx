"use client";

import { useMemo, useState } from "react";
import StatTile from "@/components/StatTile";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import DeliveryTable from "@/components/DeliveryTable";
import { formatKoreanDate } from "@/lib/date";
import type { DeliveryWithCompany } from "@/lib/types";

export default function AssemblyDashboardClient({
  deliveries,
  calendarDates,
  today,
  bufferMinutes,
  prevHref,
  nextHref,
  readOnly = false,
}: {
  deliveries: DeliveryWithCompany[];
  calendarDates: string[];
  today: string;
  bufferMinutes: number;
  prevHref: string;
  nextHref: string;
  /** Admin's cross-company view: same screen, no approve/reject/settings
   * actions — this is someone else's booking queue, not the viewer's own. */
  readOnly?: boolean;
}) {
  const [rawSelectedDate, setSelectedDate] = useState(today);

  // Navigating a week via prev/next re-renders this component with a new
  // calendarDates window (server round trip) — if the previously selected
  // date isn't in view anymore, fall back to today (if visible) or the
  // first day of the new window, without needing an effect to reconcile it.
  const selectedDate = calendarDates.includes(rawSelectedDate)
    ? rawSelectedDate
    : calendarDates.includes(today)
      ? today
      : calendarDates[0];

  const byDate = useMemo(() => {
    const map = new Map<string, DeliveryWithCompany[]>();
    for (const d of deliveries) {
      // requested_at is stored in UTC; re-key by the local calendar date
      // (sv-SE locale formats as YYYY-MM-DD) so it lines up with the dates
      // shown in the heatmap.
      const localDate = new Date(d.requested_at).toLocaleDateString("sv-SE");
      if (!map.has(localDate)) map.set(localDate, []);
      map.get(localDate)!.push(d);
    }
    return map;
  }, [deliveries]);

  const countsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [date, rows] of byDate) counts[date] = rows.length;
    return counts;
  }, [byDate]);

  const selectedRows = byDate.get(selectedDate) ?? [];
  const selectedCounts = {
    total: selectedRows.length,
    pending: selectedRows.filter((d) => d.status === "pending").length,
    approved: selectedRows.filter((d) => d.status === "approved").length,
    rejected: selectedRows.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-800">납품 현황</h1>

      <HeatmapCalendar
        dates={calendarDates}
        countsByDate={countsByDate}
        today={today}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        prevHref={prevHref}
        nextHref={nextHref}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-500">
            {formatKoreanDate(selectedDate)} 현황
          </h2>
          {selectedDate !== today && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="text-xs font-medium text-[#2563EB] no-underline hover:underline"
            >
              오늘로 이동
            </button>
          )}
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="총 예약" value={selectedCounts.total} />
          <StatTile label="대기중" value={selectedCounts.pending} accent="amber" />
          <StatTile label="승인됨" value={selectedCounts.approved} accent="green" />
          <StatTile label="반려됨" value={selectedCounts.rejected} accent="red" />
        </div>

        <DeliveryTable
          rows={selectedRows}
          bufferMinutes={bufferMinutes}
          emptyLabel="이 날짜에 등록된 예약이 없습니다."
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
