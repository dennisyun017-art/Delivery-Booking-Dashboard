"use client";

import { useEffect, useRef } from "react";
import { login } from "@/app/login/actions";

const REMEMBERED_EMAIL_KEY = "delivery-scheduler:remembered-email";

export default function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);

  // Mutates the DOM nodes directly (like an uncontrolled form) instead of
  // routing this through React state, so there's nothing to reconcile
  // against the server-rendered (empty, unchecked) markup on hydration.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) {
        if (emailRef.current) emailRef.current.value = saved;
        if (rememberRef.current) rememberRef.current.checked = true;
      }
    } catch {
      // localStorage can throw in private-browsing / disabled-storage
      // contexts — remembering the email is a convenience, not essential.
    }
  }, []);

  // Runs alongside the form's own `action={login}` server action — this
  // only persists/clears the remembered email and does not prevent the
  // normal submission (and the server action's redirect) from proceeding.
  const handleSubmit = () => {
    try {
      if (rememberRef.current?.checked && emailRef.current?.value) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, emailRef.current.value);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch {
      // ignore
    }
  };

  return (
    <form action={login} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-slate-600">
          이메일
        </label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          required
          placeholder="example@company.com"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-slate-600">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="비밀번호를 입력하세요"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          ref={rememberRef}
          type="checkbox"
          defaultChecked={false}
          className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
        />
        이메일 기억하기
      </label>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
      >
        로그인
      </button>
    </form>
  );
}
