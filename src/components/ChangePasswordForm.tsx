"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setPassword("");
    setConfirm("");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)] md:max-w-sm"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">비밀번호가 변경됐습니다.</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-xs font-medium text-slate-600">
          새 비밀번호
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상 입력하세요"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-xs font-medium text-slate-600">
          새 비밀번호 확인
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="한 번 더 입력하세요"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {pending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
