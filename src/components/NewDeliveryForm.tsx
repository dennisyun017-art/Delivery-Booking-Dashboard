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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-assembly" className="text-xs font-medium text-slate-600">
          Assembly 회사
        </label>
        <select
          id="new-assembly"
          name="assembly_company_id"
          required
          defaultValue=""
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        >
          <option value="" disabled>
            Assembly 회사 선택
          </option>
          {assemblyCompanies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-requested-at" className="text-xs font-medium text-slate-600">
          납품 예정 일시
        </label>
        <input
          id="new-requested-at"
          name="requested_at"
          type="datetime-local"
          required
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-lot" className="text-xs font-medium text-slate-600">
            LOT No.
          </label>
          <input
            id="new-lot"
            name="lot_no"
            required
            placeholder="예: LOT-2026081"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-wo" className="text-xs font-medium text-slate-600">
            W/O No.
          </label>
          <input
            id="new-wo"
            name="wo_no"
            required
            placeholder="예: WO-10234"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-contact" className="text-xs font-medium text-slate-600">
          연락처 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="new-contact"
          name="contact_phone"
          type="tel"
          placeholder="예: 010-1234-5678"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-note" className="text-xs font-medium text-slate-600">
          비고 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="new-note"
          name="note"
          placeholder="차량번호, 품목 등"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {pending ? "등록 중..." : "예약 등록"}
      </button>
    </form>
  );
}
