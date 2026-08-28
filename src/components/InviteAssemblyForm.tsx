"use client";

import { useState, useTransition } from "react";
import { createAssemblyCompanyDirect, inviteAssemblyCompany } from "@/app/admin/actions";
import { useCompanySimilarityWarning } from "@/hooks/useCompanySimilarityWarning";

export default function InviteAssemblyForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const similarTo = useCompanySimilarityWarning(companyName);
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const buildFormData = () => {
    const fd = new FormData();
    fd.set("company_name", companyName.trim());
    fd.set("email", email.trim());
    fd.set("phone", phone.trim());
    fd.set("business_desc", businessDesc.trim());
    return fd;
  };

  const resetFields = () => {
    setCompanyName("");
    setEmail("");
    setPhone("");
    setBusinessDesc("");
  };

  const resetMessages = () => {
    setError(null);
    setInviteSuccess(false);
    setCreated(null);
  };

  const handleInvite = () => {
    resetMessages();
    if (!companyName.trim() || !email.trim()) {
      setError("회사명과 이메일을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      try {
        await inviteAssemblyCompany(buildFormData());
        setInviteSuccess(true);
        resetFields();
      } catch (e) {
        setError(e instanceof Error ? e.message : "초대에 실패했습니다.");
      }
    });
  };

  const handleDirectCreate = () => {
    resetMessages();
    if (!companyName.trim() || !email.trim()) {
      setError("회사명과 이메일을 입력해주세요.");
      return;
    }
    const emailForResult = email.trim();
    startTransition(async () => {
      try {
        const result = await createAssemblyCompanyDirect(buildFormData());
        setCreated({ email: emailForResult, tempPassword: result.tempPassword });
        resetFields();
      } catch (e) {
        setError(e instanceof Error ? e.message : "계정 생성에 실패했습니다.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)] md:max-w-md">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {inviteSuccess && <p className="text-sm text-green-600">초대 이메일을 보냈습니다.</p>}

      {created && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
          <p className="font-medium">계정이 바로 생성됐습니다. 아래 정보를 전화/카카오톡으로 전달해주세요:</p>
          <p className="mt-1.5">
            이메일: <span className="font-mono">{created.email}</span>
          </p>
          <p>
            임시 비밀번호: <span className="font-mono font-bold">{created.tempPassword}</span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            이 비밀번호는 다시 확인할 수 없으니 지금 바로 전달해주세요.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-company" className="text-xs font-medium text-slate-600">
          회사명
        </label>
        <input
          id="invite-company"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="예: 현대모비스"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
        {similarTo && (
          <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
            혹시 이미 등록된 <span className="font-medium">&ldquo;{similarTo}&rdquo;</span>와 같은
            회사인가요? 다른 회사라면 무시하고 진행하세요.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-business-desc" className="text-xs font-medium text-slate-600">
          업종/설명 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="invite-business-desc"
          value={businessDesc}
          onChange={(e) => setBusinessDesc(e.target.value)}
          placeholder="예: 가공, 판금"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-email" className="text-xs font-medium text-slate-600">
          이메일
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@company.com"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-phone" className="text-xs font-medium text-slate-600">
          연락처 <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="invite-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="예: 010-1234-5678"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleInvite}
          disabled={pending}
          className="flex-1 rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {pending ? "처리 중..." : "이메일로 초대"}
        </button>
        <button
          type="button"
          onClick={handleDirectCreate}
          disabled={pending}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          {pending ? "처리 중..." : "임시 비밀번호로 즉시 생성"}
        </button>
      </div>
      <p className="text-xs text-slate-400">
        이메일 초대가 안 갈 때는 &ldquo;임시 비밀번호로 즉시 생성&rdquo;을 쓰고 직접 전달해주세요.
      </p>
    </div>
  );
}
