"use client";

import { useEffect } from "react";
import DeliveryTable from "@/components/DeliveryTable";
import { formatKoreanDate } from "@/lib/date";
import type { DeliveryWithCompany } from "@/lib/types";

export default function DayDetailModal({
  date,
  rows,
  bufferMinutes,
  onClose,
}: {
  date: string;
  rows: DeliveryWithCompany[];
  bufferMinutes: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{formatKoreanDate(date)}</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <DeliveryTable
          rows={rows}
          bufferMinutes={bufferMinutes}
          showSearch={rows.length > 5}
          emptyLabel="이 날짜에 등록된 예약이 없습니다."
        />
      </div>
    </div>
  );
}
