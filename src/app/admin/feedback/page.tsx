import { createAdminClient } from "@/lib/supabase/admin";
import FeedbackStatusBadge from "@/components/FeedbackStatusBadge";
import FeedbackReplyForm from "@/components/FeedbackReplyForm";
import type { Feedback } from "@/lib/types";

export default async function AdminFeedbackPage() {
  const admin = createAdminClient();

  const [{ data: feedback }, { data: profiles }] = await Promise.all([
    admin.from("feedback").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, company_name, role"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const rows = await Promise.all(
    ((feedback ?? []) as Feedback[]).map(async (f) => {
      let imageUrl: string | null = null;
      if (f.image_path) {
        const { data } = await admin.storage.from("feedback").createSignedUrl(f.image_path, 3600);
        imageUrl = data?.signedUrl ?? null;
      }
      const reporter = profileMap.get(f.reporter_id);
      return {
        ...f,
        imageUrl,
        companyName: reporter?.company_name ?? "알 수 없음",
        reporterRole: reporter?.role ?? "-",
      };
    }),
  );

  const openCount = rows.filter((r) => r.status === "open").length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">문의/오류 관리</h2>
        <p className="mt-1 text-sm text-slate-500">
          {openCount > 0 ? `대기중 ${openCount}건` : "대기중인 문의가 없습니다."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">접수된 문의가 없습니다.</p>
        )}
        {rows.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{f.companyName}</p>
                <p className="text-xs text-slate-400">
                  {new Date(f.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <FeedbackStatusBadge status={f.status} />
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{f.message}</p>

            {f.imageUrl && (
              <a href={f.imageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed
                    Supabase Storage URL, not worth wiring up next/image's
                    remotePatterns for a project-specific dynamic host. */}
                <img
                  src={f.imageUrl}
                  alt="첨부 이미지"
                  className="max-h-48 rounded-lg border border-slate-100"
                />
              </a>
            )}

            <FeedbackReplyForm id={f.id} defaultReply={f.admin_reply ?? ""} defaultStatus={f.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
