import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">납품 시간 예약</h1>
          <p className="mt-1.5 text-sm text-slate-500">로그인해서 계속하기</p>
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <LoginForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-[#2563EB] no-underline hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
