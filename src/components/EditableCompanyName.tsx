"use client";

import { useState, useTransition } from "react";
import { updateCompanyName } from "@/app/admin/actions";

export default function EditableCompanyName({
  id,
  companyName,
}: {
  id: string;
  companyName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(companyName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-800">{companyName}</span>
        <button
          type="button"
          onClick={() => {
            setValue(companyName);
            setError(null);
            setEditing(true);
          }}
          className="text-xs font-medium text-[#2563EB] no-underline hover:underline"
        >
          수정
        </button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateCompanyName(formData);
            setEditing(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
          }
        });
      }}
      className="flex flex-col gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-1.5">
        <input
          name="company_name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-40 rounded-md border border-slate-200 px-2 py-1 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#2563EB] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {pending ? "저장 중" : "저장"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
        >
          취소
        </button>
      </div>
      {error && <p className="max-w-[200px] text-xs text-red-600">{error}</p>}
    </form>
  );
}
