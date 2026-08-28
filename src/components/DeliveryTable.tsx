"use client";

import { useMemo, useState } from "react";
import DeliveryTableRow from "@/components/DeliveryTableRow";
import { findConflictingIds } from "@/lib/conflicts";
import type { DeliveryStatus, DeliveryWithCompany } from "@/lib/types";

type SizeParam = "50" | "100" | "200" | "all";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "대기중",
  approved: "승인됨",
  rejected: "반려됨",
};

type ColumnFilters = {
  company: string;
  contact: string;
  lot: string;
  wo: string;
  request: string;
  status: string;
};

const EMPTY_FILTERS: ColumnFilters = {
  company: "",
  contact: "",
  lot: "",
  wo: "",
  request: "",
  status: "",
};

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs font-normal text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
    />
  );
}

export default function DeliveryTable({
  rows,
  bufferMinutes,
  showSearch = true,
  emptyLabel = "등록된 예약이 없습니다.",
  readOnly = false,
}: {
  rows: DeliveryWithCompany[];
  bufferMinutes: number;
  showSearch?: boolean;
  emptyLabel?: string;
  readOnly?: boolean;
}) {
  const [filters, setFilters] = useState<ColumnFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<SizeParam>("50");

  const setFilter = (key: keyof ColumnFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  // Conflicts are computed against the full set for the day, not the
  // filtered view — filtering the list shouldn't hide a real scheduling
  // clash from the rows that remain visible.
  const conflicts = useMemo(() => findConflictingIds(rows, bufferMinutes), [rows, bufferMinutes]);

  const filteredRows = useMemo(() => {
    const company = filters.company.trim().toLowerCase();
    const contact = filters.contact.trim().toLowerCase();
    const lot = filters.lot.trim().toLowerCase();
    const wo = filters.wo.trim().toLowerCase();
    const request = filters.request.trim().toLowerCase();
    const status = filters.status.trim().toLowerCase();
    if (!company && !contact && !lot && !wo && !request && !status) return rows;

    return rows.filter((d) => {
      // The 납품사 column also shows delivery.note as a subtext line, so the
      // filter for that column should match either.
      if (
        company &&
        !d.company_name.toLowerCase().includes(company) &&
        !(d.note ?? "").toLowerCase().includes(company)
      )
        return false;
      if (contact && !(d.contact_phone ?? "").toLowerCase().includes(contact)) return false;
      if (lot && !(d.lot_no ?? "").toLowerCase().includes(lot)) return false;
      if (wo && !(d.wo_no ?? "").toLowerCase().includes(wo)) return false;
      if (request && !(d.request_note ?? "").toLowerCase().includes(request)) return false;
      if (status && !STATUS_LABELS[d.status].toLowerCase().includes(status)) return false;
      return true;
    });
  }, [rows, filters]);

  const perPage = size === "all" ? Math.max(filteredRows.length, 1) : Number(size);
  const totalPages = size === "all" ? 1 : Math.max(1, Math.ceil(filteredRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visibleRows =
    size === "all" ? filteredRows : filteredRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  const hasAnyFilter = Object.values(filters).some((v) => v.trim());

  return (
    <div className="flex flex-col gap-3">
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
            {showSearch && (
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-3 py-2" />
                <th className="px-3 py-2">
                  <FilterInput
                    value={filters.company}
                    onChange={(v) => setFilter("company", v)}
                    placeholder="필터"
                  />
                </th>
                <th className="px-3 py-2">
                  <FilterInput
                    value={filters.contact}
                    onChange={(v) => setFilter("contact", v)}
                    placeholder="필터"
                  />
                </th>
                <th className="px-3 py-2">
                  <FilterInput
                    value={filters.lot}
                    onChange={(v) => setFilter("lot", v)}
                    placeholder="필터"
                  />
                </th>
                <th className="px-3 py-2">
                  <FilterInput
                    value={filters.wo}
                    onChange={(v) => setFilter("wo", v)}
                    placeholder="필터"
                  />
                </th>
                <th className="px-3 py-2">
                  <FilterInput
                    value={filters.request}
                    onChange={(v) => setFilter("request", v)}
                    placeholder="필터"
                  />
                </th>
                <th className="px-3 py-2">
                  <FilterInput
                    value={filters.status}
                    onChange={(v) => setFilter("status", v)}
                    placeholder="필터"
                  />
                </th>
                <th className="px-3 py-2" />
              </tr>
            )}
          </thead>
          <tbody>
            {visibleRows.map((d) => (
              <DeliveryTableRow
                key={d.id}
                delivery={d}
                isConflict={conflicts.has(d.id)}
                bufferMinutes={bufferMinutes}
                readOnly={readOnly}
              />
            ))}
          </tbody>
        </table>

        {visibleRows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            {rows.length === 0 ? emptyLabel : "필터와 일치하는 예약이 없습니다."}
          </p>
        )}
      </div>

      {filteredRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-slate-500">
          <p>
            총 {filteredRows.length}건
            {hasAnyFilter && rows.length !== filteredRows.length && ` (전체 ${rows.length}건 중)`}
            {size !== "all" && ` · ${currentPage}/${totalPages} 페이지`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {(["50", "100", "200", "all"] as SizeParam[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setPage(1);
                  }}
                  className={`rounded-md px-2 py-1 text-xs ${
                    size === s
                      ? "bg-[#2563EB] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s === "all" ? "전체" : s}
                </button>
              ))}
            </div>
            {size !== "all" && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {conflicts.size > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          ⚠️ {conflicts.size}건이 다른 예약과 {bufferMinutes}분 이내로 겹칩니다.
        </p>
      )}
    </div>
  );
}
