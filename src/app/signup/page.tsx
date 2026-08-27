import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">회원가입</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            납품 BP사 계정을 만듭니다. Assembly BP사 계정은 관리자가 이메일로
            초대해드려요.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <form action={signup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="company_name" className="text-xs font-medium text-slate-600">
              회사명
            </label>
            <input
              id="company_name"
              name="company_name"
              required
              placeholder="예: 대한물류"
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

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-[#2563EB] no-underline hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
