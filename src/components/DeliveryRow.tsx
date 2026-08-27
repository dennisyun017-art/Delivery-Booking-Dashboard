"use client";

import { useState, useTransition } from "react";
import { approveDelivery, rejectDelivery } from "@/app/assembly/actions";
import StatusBadge from "@/components/StatusBadge";
import type { Delivery } from "@/lib/types";

const ROW_GRID = "md:grid-cols-[110px_1.4fr_110px_110px_90px_200px]";

export default function DeliveryRow({
  delivery,
  companyName,
  isConflict,
  bufferMinutes,
}: {
  delivery: Delivery;
  companyName: string;
  isConflict: boolean;
  bufferMinutes: number;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const runApprove = () => {
    setError(null);
    const fd = new FormData();
    fd.set("id", delivery.id);
    startTransition(async () => {
      try {
        await approveDelivery(fd);
      } catch (e) {
        setError(e instanceof Error ? e.message : "처리에 실패했습니다.");
      }
    });
  };

  const subtext = [delivery.note, delivery.contact_phone ? `☎ ${delivery.contact_phone}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div
        className={`grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-lg px-3 py-3 md:items-center md:rounded-none md:px-0 ${ROW_GRID} ${
          isConflict ? "bg-amber-50" : ""
        }`}
      >
        <div className="text-sm text-slate-700">
          <span className="mr-1.5 text-xs text-slate-400 md:hidden">시간</span>
          {new Date(delivery.requested_at).toLocaleString("ko-KR", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isConflict && (
            <span
              title={`다른 예약과 ${bufferMinutes}분 이내로 겹칩니다`}
              className="ml-1.5 text-amber-500"
            >
              ⚠️
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{companyName}</p>
          {subtext && <p className="truncate text-xs text-slate-400">{subtext}</p>}
        </div>

        <div className="text-sm text-slate-600">
          <span className="mr-1.5 text-xs text-slate-400 md:hidden">LOT</span>
          {delivery.lot_no}
        </div>

        <div className="text-sm text-slate-600">
          <span className="mr-1.5 text-xs text-slate-400 md:hidden">W/O</span>
          {delivery.wo_no}
        </div>

        <div>
          <StatusBadge status={delivery.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {error && <p className="w-full text-xs text-red-600 md:text-right">{error}</p>}
          {delivery.status === "pending" && !rejecting && (
            <>
              <button
                onClick={runApprove}
                disabled={pending}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {pending ? "처리 중..." : "승인"}
              </button>
              <button
                onClick={() => setRejecting(true)}
                disabled={pending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                반려
              </button>
            </>
          )}
          {delivery.status === "rejected" && delivery.reject_reason && (
            <span
              title={delivery.reject_reason}
              className="max-w-[220px] truncate text-xs text-slate-400 md:text-right"
            >
              사유: {delivery.reject_reason}
            </span>
          )}
        </div>
      </div>

      {rejecting && (
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              try {
                await rejectDelivery(formData);
                setRejecting(false);
              } catch (e) {
                setError(e instanceof Error ? e.message : "처리에 실패했습니다.");
              }
            });
          }}
          className="mb-3 flex flex-col gap-2 rounded-lg bg-slate-50 p-3 md:ml-[calc(110px+1rem)]"
        >
          <input type="hidden" name="id" value={delivery.id} />
          <textarea
            name="reason"
            required
            placeholder="반려 사유를 입력해주세요"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "처리 중..." : "반려 확정"}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export { ROW_GRID };
