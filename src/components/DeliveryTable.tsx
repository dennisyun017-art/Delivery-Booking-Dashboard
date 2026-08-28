"use client";

import { useMemo, useState } from "react";
import DeliveryTableRow from "@/components/DeliveryTableRow";
import { findConflictingIds } from "@/lib/conflicts";
import type { DeliveryWithCompany } from "@/lib/types";

export default function DeliveryTable({
  rows,
  bufferMinutes,
  showSearch = true,
  emptyLabel = "등록된 예약이 없습니다.",
}: {
  rows: DeliveryWithCompany[];
  bufferMinutes: number;
  showSearch?: boolean;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");

  // Conflicts are computed against the full set for the day, not the
  // filtered view — filtering the list shouldn't hide a real scheduling
  // clash from the rows that remain visible.
  const conflicts = useMemo(() => findConflictingIds(rows, bufferMinutes), [rows, bufferMinutes]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((d) =>
      [d.company_name, d.lot_no, d.wo_no, d.note, d.contact_phone, d.request_note]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="flex flex-col gap-3">
      {showSearch && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="납품사, 연락처, LOT, W/O, 요청 사항으로 검색"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgb(0,0,0,0.04)]">
        <table className="w-full min-w-[940px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
              <th className="px-3 py-2.5 font-medium">시간</th>
              <th className="px-3 py-2.5 font-medium">납품사</th>
              <th className="px-3 py-2.5 font-medium">연락처</th>
              <th className="px-3 py-2.5 font-medium">LOT</th>
              <th className="px-3 py-2.5 font-medium">W/O</th>
              <th className="px-3 py-2.5 font-medium">요청 사항</th>
              <th className="px-3 py-2.5 font-medium">상태</th>
              <th className="px-3 py-2.5 text-right font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((d) => (
              <DeliveryTableRow
                key={d.id}
                delivery={d}
                isConflict={conflicts.has(d.id)}
                bufferMinutes={bufferMinutes}
              />
            ))}
          </tbody>
        </table>

        {visibleRows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            {rows.length === 0 ? emptyLabel : "검색 결과가 없습니다."}
          </p>
        )}
      </div>

      {conflicts.size > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          ⚠️ {conflicts.size}건이 다른 예약과 {bufferMinutes}분 이내로 겹칩니다.
        </p>
      )}
    </div>
  );
}
