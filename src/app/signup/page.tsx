import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="mt-1 text-sm text-gray-500">
          우리 회사가 어떤 역할인지 선택해주세요. 가입 후에는 바꿀 수 없으니
          신중하게 선택해주세요.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <form action={signup} className="flex flex-col gap-4">
        <fieldset className="flex gap-3">
          <label className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-3 text-center has-[:checked]:border-black has-[:checked]:bg-gray-50">
            <input
              type="radio"
              name="role"
              value="delivery"
              defaultChecked
              className="sr-only"
            />
            <span className="font-medium">납품 BP사</span>
            <span className="text-xs text-gray-500">납품 시간 등록</span>
          </label>
          <label className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-3 text-center has-[:checked]:border-black has-[:checked]:bg-gray-50">
            <input type="radio" name="role" value="assembly" className="sr-only" />
            <span className="font-medium">Assembly BP사</span>
            <span className="text-xs text-gray-500">납품 시간 확정</span>
          </label>
        </fieldset>

        <input
          name="company_name"
          required
          placeholder="회사명"
          className="rounded-md border px-3 py-2"
        />
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
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          className="rounded-md border px-3 py-2"
        />

        <button
          type="submit"
          className="rounded-md bg-black px-3 py-2 font-medium text-white"
        >
          가입하기
        </button>
      </form>

      <p className="text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-black underline">
          로그인
        </Link>
      </p>
    </main>
  );
}
