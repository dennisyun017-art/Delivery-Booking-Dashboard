import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import FeedbackForm from "@/components/FeedbackForm";
import FeedbackStatusBadge from "@/components/FeedbackStatusBadge";
import type { Feedback } from "@/lib/types";

export default async function FeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("reporter_id", user!.id)
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const rows = await Promise.all(
    ((feedback ?? []) as Feedback[]).map(async (f) => {
      let imageUrl: string | null = null;
      if (f.image_path) {
        const { data } = await admin.storage.from("feedback").createSignedUrl(f.image_path, 3600);
        imageUrl = data?.signedUrl ?? null;
      }
      return { ...f, imageUrl };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">문의/오류 신고</h2>
        <FeedbackForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">내 문의 내역</h2>
        <div className="flex flex-col gap-3">
          {rows.length === 0 && <p className="text-sm text-slate-400">등록된 문의가 없습니다.</p>}
          {rows.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  {new Date(f.created_at).toLocaleString("ko-KR")}
                </p>
                <FeedbackStatusBadge status={f.status} />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{f.message}</p>
              {f.imageUrl && (
                <a href={f.imageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed
                      Supabase Storage URL, not worth wiring up next/image's
                      remotePatterns for a project-specific dynamic host. */}
                  <img
                    src={f.imageUrl}
                    alt="첨부 이미지"
                    className="max-h-40 rounded-lg border border-slate-100"
                  />
                </a>
              )}
              {f.admin_reply && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-700">관리자 답변</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{f.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
