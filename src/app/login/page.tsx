import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-bold">납품 시간 예약</h1>
        <p className="mt-1 text-sm text-gray-500">로그인해서 계속하기</p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <form action={login} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="이메일"
          className="rounded-md border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          className="rounded-md border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-black px-3 py-2 font-medium text-white"
        >
          로그인
        </button>
      </form>

      <p className="text-sm text-gray-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-black underline">
          회원가입
        </Link>
      </p>
    </main>
  );
}
