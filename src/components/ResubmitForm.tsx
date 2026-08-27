"use client";

import { useState, useTransition } from "react";
import { resubmitDelivery } from "@/app/delivery/actions";
import type { Delivery } from "@/lib/types";

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function ResubmitForm({ delivery }: { delivery: Delivery }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-sm font-medium text-black underline"
      >
        시간 재입력
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await resubmitDelivery(formData);
            setOpen(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "재입력에 실패했습니다.");
          }
        });
      }}
      className="mt-2 flex flex-col gap-2"
    >
      <input type="hidden" name="id" value={delivery.id} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        name="requested_at"
        type="datetime-local"
        required
        defaultValue={toLocalInputValue(delivery.requested_at)}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <input
        name="note"
        defaultValue={delivery.note ?? ""}
        placeholder="비고"
        className="rounded-md border px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {pending ? "제출 중..." : "재입력 제출"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          취소
        </button>
      </div>
    </form>
  );
}
