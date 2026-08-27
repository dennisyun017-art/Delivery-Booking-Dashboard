"use client";

import { useState, useTransition } from "react";
import { updateConflictBuffer } from "@/app/assembly/actions";

export default function SettingsForm({ defaultMinutes }: { defaultMinutes: number }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          try {
            await updateConflictBuffer(formData);
            setSaved(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
          }
        });
      }}
      className="flex max-w-xs flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      <label className="text-sm font-medium">
        시간 겹침 기준 (분)
        <input
          name="conflict_buffer_minutes"
          type="number"
          min={0}
          step={5}
          defaultValue={defaultMinutes}
          required
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>
      <p className="text-xs text-gray-500">
        이 시간 이내로 예약이 몰리면 대시보드에서 겹침으로 표시됩니다.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">저장되었습니다.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
