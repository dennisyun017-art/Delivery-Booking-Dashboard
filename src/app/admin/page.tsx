import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteAssemblyForm from "@/components/InviteAssemblyForm";
import DeleteAssemblyCompanyButton from "@/components/DeleteAssemblyCompanyButton";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: assemblyCompanies } = await supabase
    .from("profiles")
    .select("id, company_name, created_at")
    .eq("role", "assembly")
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const rows = await Promise.all(
    (assemblyCompanies ?? []).map(async (c) => {
      const { data } = await admin.auth.admin.getUserById(c.id);
      return {
        ...c,
        email: data.user?.email ?? "-",
        joined: !!data.user?.last_sign_in_at,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Assembly 회사 초대</h2>
        <InviteAssemblyForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Assembly 회사 목록</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgb(0,0,0,0.04)]">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
                <th className="px-3 py-2.5 font-medium">회사명</th>
                <th className="px-3 py-2.5 font-medium">이메일</th>
                <th className="px-3 py-2.5 font-medium">상태</th>
                <th className="px-3 py-2.5 text-right font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2.5 text-sm text-slate-800">{r.company_name}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{r.email}</td>
                  <td className="px-3 py-2.5 text-sm">
                    {r.joined ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        가입 완료
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        초대 대기중
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DeleteAssemblyCompanyButton id={r.id} companyName={r.company_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              등록된 assembly 회사가 없습니다.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
