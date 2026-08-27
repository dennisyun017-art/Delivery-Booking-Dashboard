"use client";

import { useMemo, useState } from "react";
import StatTile from "@/components/StatTile";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import DeliveryTable from "@/components/DeliveryTable";
import DayDetailModal from "@/components/DayDetailModal";
import { formatKoreanDate } from "@/lib/date";
import type { DeliveryWithCompany } from "@/lib/types";

export default function AssemblyDashboardClient({
  deliveries,
  calendarDates,
  today,
  bufferMinutes,
}: {
  deliveries: DeliveryWithCompany[];
  calendarDates: string[];
  today: string;
  bufferMinutes: number;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const todayRows = byDate.get(today) ?? [];
  const todayCounts = {
    total: todayRows.length,
    pending: todayRows.filter((d) => d.status === "pending").length,
    approved: todayRows.filter((d) => d.status === "approved").length,
    rejected: todayRows.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-slate-800">납품 현황</h1>
        <p className="text-sm text-slate-500">오늘 {formatKoreanDate(today)}</p>
      </div>

      <HeatmapCalendar
        dates={calendarDates}
        countsByDate={countsByDate}
        today={today}
        onSelect={setSelectedDate}
      />

      <div>
        <h2 className="mb-3 text-sm font-medium text-slate-500">오늘 현황</h2>
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="총 예약" value={todayCounts.total} />
          <StatTile label="대기중" value={todayCounts.pending} accent="amber" />
          <StatTile label="승인됨" value={todayCounts.approved} accent="green" />
          <StatTile label="반려됨" value={todayCounts.rejected} accent="red" />
        </div>

        <DeliveryTable
          rows={todayRows}
          bufferMinutes={bufferMinutes}
          emptyLabel="오늘 등록된 예약이 없습니다."
        />
      </div>

      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          rows={byDate.get(selectedDate) ?? []}
          bufferMinutes={bufferMinutes}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
