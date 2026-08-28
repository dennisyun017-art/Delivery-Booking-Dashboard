import ChangePasswordForm from "@/components/ChangePasswordForm";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">비밀번호 변경</h2>
        <p className="mt-1 text-sm text-slate-500">현재 로그인한 계정의 비밀번호를 변경합니다.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
