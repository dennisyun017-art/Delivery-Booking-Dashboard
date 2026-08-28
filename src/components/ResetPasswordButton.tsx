"use client";

import { useState, useTransition } from "react";
import { resetCompanyPassword } from "@/app/admin/actions";

export default function ResetPasswordButton({
  id,
  companyName,
}: {
  id: string;
  companyName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleReset = () => {
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      try {
        const result = await resetCompanyPassword(fd);
        setTempPassword(result.tempPassword);
        setConfirming(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "초기화에 실패했습니다.");
        setConfirming(false);
      }
    });
  };

  if (tempPassword) {
    return (
      <div className="text-xs text-slate-600">
        <p>
          새 비밀번호: <span className="font-mono font-bold">{tempPassword}</span>
        </p>
        <p className="text-slate-400">지금 바로 전달해주세요 (다시 확인 불가)</p>
      </div>
    );
  }

  if (error) {
    return (
      <span className="text-xs text-red-600" title={error}>
        초기화 실패
      </span>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <span className="whitespace-nowrap text-xs text-slate-500">{companyName} 비번 초기화?</span>
        <button
          type="button"
          onClick={handleReset}
          disabled={pending}
          className="rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
        >
          {pending ? "처리 중..." : "확인"}
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
      className="text-xs font-medium text-amber-600 no-underline hover:underline"
    >
      비번 초기화
    </button>
  );
}
