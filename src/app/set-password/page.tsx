"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)]">
        {children}
      </div>
    </main>
  );
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Require an explicit tap before consuming the one-time invite token.
  // Mobile mail apps (Gmail in particular) often prefetch/scan links in an
  // email before the person taps them; if the link itself verified the
  // token on load, that prefetch burns the token and the real click always
  // sees "expired". Gating the actual verifyOtp() call behind a button
  // means only a genuine tap consumes it.
  const [activated, setActivated] = useState(false);
  // Only need to check for a fallback session when there's no token_hash to
  // gate on (see the effect below) — otherwise nothing to wait for.
  const [checkingSession, setCheckingSession] = useState(() => !tokenHash);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Fallback for the old link format (Supabase's default invite template,
  // before it's updated per the README) — that one establishes the session
  // itself via a URL hash fragment on load, so there's no token_hash query
  // param to gate on. If a session already exists, skip straight past the
  // activation step.
  useEffect(() => {
    if (tokenHash) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setActivated(!!data.session);
      setCheckingSession(false);
    });
  }, [tokenHash]);

  const handleActivate = async () => {
    if (!tokenHash || !type) {
      setError("잘못된 링크입니다. 관리자에게 재초대를 요청해주세요.");
      return;
    }
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

    setPending(false);
    if (error) {
      setError("초대 링크가 만료되었거나 이미 사용됐습니다. 관리자에게 재초대를 요청해주세요.");
      return;
    }
    setActivated(true);
  };

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

  if (checkingSession) {
    return null;
  }

  if (!activated) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">초대 확인</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            아래 버튼을 눌러 초대를 확인하고 계정을 활성화해주세요.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleActivate}
          disabled={pending}
          className="w-full rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {pending ? "확인 중..." : "계정 활성화하기"}
        </button>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">비밀번호 설정</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          계정이 확인됐습니다. 사용할 비밀번호를 설정해주세요.
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
    </>
  );
}

export default function SetPasswordPage() {
  return (
    <Card>
      <Suspense fallback={null}>
        <SetPasswordForm />
      </Suspense>
    </Card>
  );
}
