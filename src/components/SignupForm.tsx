"use client";

import { useState } from "react";
import { signup } from "@/app/signup/actions";
import { useCompanySimilarityWarning } from "@/hooks/useCompanySimilarityWarning";

export default function SignupForm() {
  const [companyName, setCompanyName] = useState("");
  const similarTo = useCompanySimilarityWarning(companyName);

  return (
    <form action={signup} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="company_name" className="text-xs font-medium text-slate-600">
          회사명
        </label>
        <input
          id="company_name"
          name="company_name"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="예: 대한물류"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
        {similarTo && (
          <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
            혹시 이미 등록된 <span className="font-medium">&ldquo;{similarTo}&rdquo;</span>와 같은
            회사인가요? 다른 회사라면 이 문구는 무시하고 계속 진행하셔도 됩니다.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business_desc" className="text-xs font-medium text-slate-600">
          업종/설명 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="business_desc"
          name="business_desc"
          placeholder="예: 가공, 판금"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-slate-600">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="example@company.com"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-xs font-medium text-slate-600">
          연락처 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="예: 010-1234-5678"
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
          minLength={6}
          placeholder="6자 이상 입력하세요"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
      >
        가입하기
      </button>
    </form>
  );
}
