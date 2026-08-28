"use client";

import { useState, useTransition } from "react";
import { deleteAssemblyCompany } from "@/app/admin/actions";

export default function DeleteAssemblyCompanyButton({
  id,
  companyName,
}: {
  id: string;
  companyName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      try {
        await deleteAssemblyCompany(fd);
      } catch (e) {
        setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
        setConfirming(false);
      }
    });
  };

  if (error) {
    return (
      <span className="text-xs text-red-600" title={error}>
        삭제 실패
      </span>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
        <span className="text-xs text-slate-500">{companyName} 삭제할까요?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "삭제 중..." : "확인"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-red-600 no-underline hover:underline"
    >
      삭제
    </button>
  );
}
