"use client";

import { useRef, useState, useTransition } from "react";
import { inviteAssemblyCompany } from "@/app/admin/actions";

export default function InviteAssemblyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setSuccess(false);
        startTransition(async () => {
          try {
            await inviteAssemblyCompany(formData);
            formRef.current?.reset();
            setSuccess(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "초대에 실패했습니다.");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)] md:max-w-md"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">초대 이메일을 보냈습니다.</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-company" className="text-xs font-medium text-slate-600">
          회사명
        </label>
        <input
          id="invite-company"
          name="company_name"
          required
          placeholder="예: 현대모비스"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-email" className="text-xs font-medium text-slate-600">
          이메일
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="example@company.com"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {pending ? "초대 중..." : "초대 이메일 보내기"}
      </button>
    </form>
  );
}
