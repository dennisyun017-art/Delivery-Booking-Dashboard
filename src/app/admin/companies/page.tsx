import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import EditableCompanyName from "@/components/EditableCompanyName";

const ROLE_LABEL: Record<string, string> = {
  assembly: "Assembly",
  delivery: "납품",
};

export default async function AdminCompaniesPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, company_name, role, phone, business_desc, created_at")
    .neq("role", "admin")
    .order("role")
    .order("company_name");

  const admin = createAdminClient();
  const rows = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { data } = await admin.auth.admin.getUserById(p.id);
      return { ...p, email: data.user?.email ?? "-" };
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">회사 목록</h2>
        <p className="mt-1 text-sm text-slate-500">
          이름이 겹치거나 비슷한 회사가 있으면 회사명을 바로 고칠 수 있습니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgb(0,0,0,0.04)]">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
              <th className="px-3 py-2.5 font-medium">회사명</th>
              <th className="px-3 py-2.5 font-medium">구분</th>
              <th className="px-3 py-2.5 font-medium">업종/설명</th>
              <th className="px-3 py-2.5 font-medium">이메일</th>
              <th className="px-3 py-2.5 font-medium">연락처</th>
              <th className="px-3 py-2.5 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2.5">
                  <EditableCompanyName id={r.id} companyName={r.company_name} />
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-600">
                  {ROLE_LABEL[r.role] ?? r.role}
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-600">{r.business_desc || "-"}</td>
                <td className="px-3 py-2.5 text-sm text-slate-600">{r.email}</td>
                <td className="px-3 py-2.5 text-sm text-slate-600">{r.phone || "-"}</td>
                <td className="px-3 py-2.5 text-sm text-slate-400">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">등록된 회사가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
