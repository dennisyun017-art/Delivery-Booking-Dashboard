import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import EditableCompanyName from "@/components/EditableCompanyName";
import ResetPasswordButton from "@/components/ResetPasswordButton";

type SizeParam = "50" | "100" | "200" | "all";
type RoleTab = "assembly" | "delivery";

function parseSize(raw: string | undefined): SizeParam {
  return raw === "100" || raw === "200" || raw === "all" ? raw : "50";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parseTab(raw: string | undefined): RoleTab {
  return raw === "delivery" ? "delivery" : "assembly";
}

type CompanyRow = {
  id: string;
  company_name: string;
  business_desc: string | null;
  phone: string | null;
  created_at: string;
  email: string;
};

async function countByRole(admin: ReturnType<typeof createAdminClient>, role: RoleTab): Promise<number> {
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", role);
  return count ?? 0;
}

async function fetchCompanies(
  admin: ReturnType<typeof createAdminClient>,
  role: RoleTab,
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

  // Emails live in auth.users, not profiles — this is a per-row admin API
  // call, so it only ever runs for the currently active tab/page, not for
  // the whole roster (that could be dozens of delivery companies).
  const rows = await Promise.all(
    (data ?? []).map(async (p) => {
      const { data: userData } = await admin.auth.admin.getUserById(p.id);
      return { ...p, email: userData.user?.email ?? "-" };
    }),
  );

  return { rows, total: count ?? 0 };
}

function CompanyTable({ rows, viewHrefBase }: { rows: CompanyRow[]; viewHrefBase?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgb(0,0,0,0.04)]">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
            <th className="px-3 py-2.5 font-medium">회사명</th>
            <th className="px-3 py-2.5 font-medium">업종/설명</th>
            <th className="px-3 py-2.5 font-medium">이메일</th>
            <th className="px-3 py-2.5 font-medium">연락처</th>
            <th className="px-3 py-2.5 font-medium">가입일</th>
            <th className="px-3 py-2.5 text-right font-medium">관리</th>
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
              <td className="px-3 py-2.5">
                <div className="flex flex-col items-end gap-1.5">
                  {viewHrefBase && (
                    <Link
                      href={`${viewHrefBase}/${r.id}`}
                      className="text-xs font-medium text-[#2563EB] no-underline hover:underline"
                    >
                      화면 보기
                    </Link>
                  )}
                  <ResetPasswordButton id={r.id} companyName={r.company_name} />
                </div>
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
  const tab = parseTab(sp.tab);
  const aPage = parsePage(sp.aPage);
  const aSize = parseSize(sp.aSize);
  const dPage = parsePage(sp.dPage);
  const dSize = parseSize(sp.dSize);

  // The admin/layout.tsx guard already confirms the caller is an admin;
  // listing companies (not just the caller's own row) needs the
  // service-role client to bypass RLS regardless.
  const admin = createAdminClient();

  // Both counts are needed for the tab labels regardless of which tab is
  // active, but the expensive part (fetching each row's email via a
  // per-row admin API call) only runs for the active tab — 납품 BP사 could
  // grow into the dozens, so there's no reason to pay that cost for a tab
  // that isn't even being shown.
  const [assemblyCount, deliveryCount] = await Promise.all([
    countByRole(admin, "assembly"),
    countByRole(admin, "delivery"),
  ]);

  const activePage = tab === "assembly" ? aPage : dPage;
  const activeSize = tab === "assembly" ? aSize : dSize;
  const { rows, total } = await fetchCompanies(admin, tab, activePage, activeSize);

  const allParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) allParams.set(k, v);

  const tabHref = (t: RoleTab) => {
    const params = new URLSearchParams(allParams);
    params.set("tab", t);
    return `/admin/companies?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">회사 목록</h2>
        <p className="mt-1 text-sm text-slate-500">
          이름이 겹치거나 비슷한 회사가 있으면 회사명을 바로 고칠 수 있습니다.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100">
        {(
          [
            ["assembly", "Assembly BP사", assemblyCount],
            ["delivery", "납품 BP사", deliveryCount],
          ] as const
        ).map(([t, label, count]) => (
          <Link
            key={t}
            href={tabHref(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium no-underline ${
              tab === t
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label} ({count})
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <CompanyTable rows={rows} viewHrefBase={tab === "assembly" ? "/admin/assembly" : undefined} />
        <Pagination
          prefix={tab === "assembly" ? "a" : "d"}
          page={activePage}
          size={activeSize}
          total={total}
          otherParams={allParams}
        />
      </section>
    </div>
  );
}
