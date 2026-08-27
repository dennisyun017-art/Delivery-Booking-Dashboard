"use client";

import { useRef, useState, useTransition } from "react";
import { createDelivery } from "@/app/delivery/actions";

export default function NewDeliveryForm({
  assemblyCompanies,
}: {
  assemblyCompanies: { id: string; company_name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createDelivery(formData);
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "등록에 실패했습니다.");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}

      <select name="assembly_company_id" required defaultValue="" className="rounded-md border px-3 py-2">
        <option value="" disabled>
          Assembly 회사 선택
        </option>
        {assemblyCompanies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.company_name}
          </option>
        ))}
      </select>

      <input
        name="requested_at"
        type="datetime-local"
        required
        className="rounded-md border px-3 py-2"
      />

      <input
        name="note"
        placeholder="비고 (품목, 차량번호 등)"
        className="rounded-md border px-3 py-2"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-3 py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "등록 중..." : "예약 등록"}
      </button>
    </form>
  );
}
