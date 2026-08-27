"use client";

import { useState, useTransition } from "react";
import { approveDelivery, rejectDelivery } from "@/app/assembly/actions";
import StatusBadge from "@/components/StatusBadge";
import type { DeliveryWithCompany } from "@/lib/types";

export default function DeliveryTableRow({
  delivery,
  isConflict,
  bufferMinutes,
}: {
  delivery: DeliveryWithCompany;
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
    <>
      <tr className={`border-b border-slate-100 last:border-0 ${isConflict ? "bg-amber-50" : ""}`}>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
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
        </td>
        <td className="max-w-[220px] px-3 py-3">
          <p className="truncate text-sm font-medium text-slate-800">{delivery.company_name}</p>
          {subtext && <p className="truncate text-xs text-slate-400">{subtext}</p>}
        </td>
        <td className="px-3 py-3 text-sm text-slate-600">{delivery.lot_no}</td>
        <td className="px-3 py-3 text-sm text-slate-600">{delivery.wo_no}</td>
        <td className="px-3 py-3">
          <StatusBadge status={delivery.status} />
        </td>
        <td className="px-3 py-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {error && <p className="w-full text-right text-xs text-red-600">{error}</p>}
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
                className="max-w-[200px] truncate text-right text-xs text-slate-400"
              >
                사유: {delivery.reject_reason}
              </span>
            )}
          </div>
        </td>
      </tr>

      {rejecting && (
        <tr className="border-b border-slate-100 last:border-0">
          <td colSpan={6} className="bg-slate-50 px-3 py-3">
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
              className="flex flex-col gap-2"
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
          </td>
        </tr>
      )}
    </>
  );
}
