"use client";

import { formatMonthDay, weekdayLabel } from "@/lib/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function levelClasses(count: number): string {
  if (count === 0) return "bg-slate-50 text-slate-300 border-slate-100";
  if (count <= 2) return "bg-blue-50 text-blue-700 border-blue-100";
  if (count <= 4) return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-blue-200 text-blue-900 border-blue-300";
}

export default function HeatmapCalendar({
  dates,
  countsByDate,
  today,
  onSelect,
}: {
  dates: string[];
  countsByDate: Record<string, number>;
  today: string;
  onSelect: (date: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-[0_1px_2px_rgb(0,0,0,0.04)] md:p-4">
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-slate-400 md:gap-2">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5 md:gap-2">
        {dates.map((date) => {
          const count = countsByDate[date] ?? 0;
          const isToday = date === today;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs transition hover:brightness-95 ${levelClasses(
                count,
              )} ${isToday ? "ring-2 ring-[#2563EB] ring-offset-1" : ""}`}
            >
              <span className={`font-medium ${isToday ? "font-bold" : ""}`}>
                {formatMonthDay(date)}
              </span>
              <span className="text-[11px]">{count > 0 ? `${count}건` : "-"}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-right text-[11px] text-slate-300">
        {weekdayLabel(today)}요일 오늘 기준 · 지난주 · 이번주 · 다음주
      </p>
    </div>
  );
}
