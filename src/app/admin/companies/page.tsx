import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import EditableCompanyName from "@/components/EditableCompanyName";

type SizeParam = "50" | "100" | "200" | "all";

function parseSize(raw: string | undefined): SizeParam {
  return raw === "100" || raw === "200" || raw === "all" ? raw : "50";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

type CompanyRow = {
  id: string;
  company_name: string;
  business_desc: string | null;
  phone: string | null;
  created_at: string;
  email: string;
};

async function fetchCompanies(
  admin: ReturnType<typeof createAdminClient>,
  role: "assembly" | "delivery",
  page: number,
  size: SizeParam,
): Promise<{ rows: CompanyRow[]; total: number }> {
  let query = admin
    .from("profiles")
    .select("id, company_name, business_desc, phone, created_at", { count: "exact" })
    .eq("role", role)
    .order("company_name");

  if (size !== "all") {
    const n = Number(size);
    const from = (page - 1) * n;
    query = query.range(from, from + n - 1);
  }

  const { data, count } = await query;

  const rows = await Promise.all(
    (data ?? []).map(async (p) => {
      const { data: userData } = await admin.auth.admin.getUserById(p.id);
      return { ...p, email: userData.user?.email ?? "-" };
    }),
  );

  return { rows, total: count ?? 0 };
}

function CompanyTable({ rows }: { rows: CompanyRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgb(0,0,0,0.04)]">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
            <th className="px-3 py-2.5 font-medium">회사명</th>
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
  );
}

function Pagination({
  prefix,
  page,
  size,
  total,
  otherParams,
}: {
  prefix: "a" | "d";
  page: number;
  size: SizeParam;
  total: number;
  otherParams: URLSearchParams;
}) {
  const perPage = size === "all" ? Math.max(total, 1) : Number(size);
  const totalPages = size === "all" ? 1 : Math.max(1, Math.ceil(total / perPage));

  const buildHref = (updates: Record<string, string>) => {
    const params = new URLSearchParams(otherParams);
    for (const [k, v] of Object.entries(updates)) params.set(k, v);
    return `/admin/companies?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-slate-500">
      <p>
        총 {total}개{size !== "all" && ` · ${page}/${totalPages} 페이지`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {(["50", "100", "200", "all"] as SizeParam[]).map((s) => (
            <Link
              key={s}
              href={buildHref({ [`${prefix}Size`]: s, [`${prefix}Page`]: "1" })}
              className={`rounded-md px-2 py-1 text-xs no-underline ${
                size === s
                  ? "bg-[#2563EB] text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "all" ? "전체" : s}
            </Link>
          ))}
        </div>
        {size !== "all" && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Link
              href={buildHref({ [`${prefix}Page`]: String(Math.max(1, page - 1)) })}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 no-underline hover:bg-slate-50"
            >
              이전
            </Link>
            <Link
              href={buildHref({ [`${prefix}Page`]: String(Math.min(totalPages, page + 1)) })}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 no-underline hover:bg-slate-50"
            >
              다음
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const aPage = parsePage(sp.aPage);
  const aSize = parseSize(sp.aSize);
  const dPage = parsePage(sp.dPage);
  const dSize = parseSize(sp.dSize);

  // The admin/layout.tsx guard already confirms the caller is an admin;
  // listing every company (not just the caller's own row) needs the
  // service-role client to bypass RLS regardless.
  const admin = createAdminClient();
  const [assembly, delivery] = await Promise.all([
    fetchCompanies(admin, "assembly", aPage, aSize),
    fetchCompanies(admin, "delivery", dPage, dSize),
  ]);

  const allParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) allParams.set(k, v);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">회사 목록</h2>
        <p className="mt-1 text-sm text-slate-500">
          이름이 겹치거나 비슷한 회사가 있으면 회사명을 바로 고칠 수 있습니다.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Assembly BP사 <span className="font-normal text-slate-400">({assembly.total})</span>
        </h3>
        <CompanyTable rows={assembly.rows} />
        <Pagination prefix="a" page={aPage} size={aSize} total={assembly.total} otherParams={allParams} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-700">
          납품 BP사 <span className="font-normal text-slate-400">({delivery.total})</span>
        </h3>
        <CompanyTable rows={delivery.rows} />
        <Pagination prefix="d" page={dPage} size={dSize} total={delivery.total} otherParams={allParams} />
      </section>
    </div>
  );
}
