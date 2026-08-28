"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import ResubmitForm from "@/components/ResubmitForm";
import type { Delivery } from "@/lib/types";

type SizeParam = "50" | "100" | "200" | "all";

export type DeliveryWithAssemblyName = Delivery & { assembly_company_name: string };

export default function MyDeliveriesList({
  deliveries,
}: {
  deliveries: DeliveryWithAssemblyName[];
}) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<SizeParam>("50");

  if (deliveries.length === 0) {
    return <p className="text-sm text-slate-400">등록된 예약이 없습니다.</p>;
  }

  const perPage = size === "all" ? Math.max(deliveries.length, 1) : Number(size);
  const totalPages = size === "all" ? 1 : Math.max(1, Math.ceil(deliveries.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible =
    size === "all" ? deliveries : deliveries.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {visible.map((d) => (
          <div
            key={d.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-slate-800">{d.assembly_company_name}</p>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {new Date(d.requested_at).toLocaleString("ko-KR")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                LOT {d.lot_no}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                W/O {d.wo_no}
              </span>
              {d.contact_phone && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  ☎ {d.contact_phone}
                </span>
              )}
            </div>
            {d.note && <p className="mt-2 text-sm text-slate-500">{d.note}</p>}
            {d.request_note && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                요청 사항: {d.request_note}
              </p>
            )}

            {d.status === "rejected" && (
              <div className="mt-3 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700">반려 사유: {d.reject_reason || "(사유 없음)"}</p>
                <ResubmitForm delivery={d} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-slate-500">
        <p>
          총 {deliveries.length}건{size !== "all" && ` · ${currentPage}/${totalPages} 페이지`}
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
    </div>
  );
}
