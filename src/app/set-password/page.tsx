"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setPending(false);
    if (error) {
      setError(
        error.message === "Auth session missing!"
          ? "초대 링크가 만료되었거나 이미 사용됐습니다. 관리자에게 재초대를 요청해주세요."
          : error.message,
      );
      return;
    }
    router.push("/");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">비밀번호 설정</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            초대받은 계정의 비밀번호를 설정하고 시작하세요.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-slate-600">
              새 비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {pending ? "저장 중..." : "비밀번호 설정하고 시작하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
