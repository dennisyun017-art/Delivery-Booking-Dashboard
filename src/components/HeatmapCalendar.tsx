"use client";

import Link from "next/link";
import { formatMonthDay, formatYearMonthRange } from "@/lib/date";

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
  selectedDate,
  onSelect,
  prevHref,
  nextHref,
}: {
  dates: string[];
  countsByDate: Record<string, number>;
  today: string;
  selectedDate: string;
  onSelect: (date: string) => void;
  prevHref: string;
  nextHref: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-[0_1px_2px_rgb(0,0,0,0.04)] md:p-4">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={prevHref}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 no-underline hover:bg-slate-50"
        >
          ◀ 이전주
        </Link>
        <p className="text-sm font-medium text-slate-700">{formatYearMonthRange(dates)}</p>
        <Link
          href={nextHref}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 no-underline hover:bg-slate-50"
        >
          다음주 ▶
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 md:gap-1.5">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 md:gap-1.5">
        {dates.map((date) => {
          const count = countsByDate[date] ?? 0;
          const isToday = date === today;
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-md border py-1 text-[11px] transition hover:brightness-95 ${levelClasses(
                count,
              )} ${isToday ? "ring-2 ring-[#2563EB] ring-offset-1" : ""} ${
                isSelected && !isToday ? "border-slate-500" : ""
              }`}
            >
              <span className={isToday ? "font-bold" : "font-medium"}>{formatMonthDay(date)}</span>
              <span className="text-[10px]">{count > 0 ? `${count}건` : "-"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
