"use client";

import { useState, useTransition } from "react";
import { approveDelivery, rejectDelivery } from "@/app/assembly/actions";

export default function DecisionForm({ deliveryId }: { deliveryId: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const runApprove = () => {
    setError(null);
    const fd = new FormData();
    fd.set("id", deliveryId);
    startTransition(async () => {
      try {
        await approveDelivery(fd);
      } catch (e) {
        setError(e instanceof Error ? e.message : "처리에 실패했습니다.");
      }
    });
  };

  if (rejecting) {
    return (
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
        className="mt-3 flex flex-col gap-2"
      >
        <input type="hidden" name="id" value={deliveryId} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <textarea
          name="reason"
          required
          placeholder="반려 사유를 입력해주세요"
          className="rounded-md border px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {pending ? "처리 중..." : "반려 확정"}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={runApprove}
          disabled={pending}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {pending ? "처리 중..." : "승인"}
        </button>
        <button
          onClick={() => setRejecting(true)}
          disabled={pending}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          반려
        </button>
      </div>
    </div>
  );
}
