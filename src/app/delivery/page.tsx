import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import NewDeliveryForm from "@/components/NewDeliveryForm";
import ResubmitForm from "@/components/ResubmitForm";
import type { Delivery } from "@/lib/types";

export default async function DeliveryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: assemblyCompanies }, { data: deliveries }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, company_name, business_desc")
      .eq("role", "assembly")
      .order("company_name"),
    supabase
      .from("deliveries")
      .select("*")
      .eq("delivery_company_id", user!.id)
      .order("requested_at", { ascending: false }),
  ]);

  const assemblyMap = new Map((assemblyCompanies ?? []).map((c) => [c.id, c.company_name]));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">새 납품 예약</h2>
        <NewDeliveryForm assemblyCompanies={assemblyCompanies ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">내 예약 목록</h2>
        <div className="flex flex-col gap-3">
          {(deliveries ?? []).length === 0 && (
            <p className="text-sm text-slate-400">등록된 예약이 없습니다.</p>
          )}
          {(deliveries as Delivery[] | null)?.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-slate-800">
                  {assemblyMap.get(d.assembly_company_id) ?? "알 수 없음"}
                </p>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {new Date(d.requested_at).toLocaleString("ko-KR")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  LOT {d.lot_no}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  W/O {d.wo_no}
                </span>
                {d.contact_phone && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    ☎ {d.contact_phone}
                  </span>
                )}
              </div>
              {d.note && <p className="mt-2 text-sm text-slate-500">{d.note}</p>}
              {d.request_note && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  요청 사항: {d.request_note}
                </p>
              )}

              {d.status === "rejected" && (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-700">
                    반려 사유: {d.reject_reason || "(사유 없음)"}
                  </p>
                  <ResubmitForm delivery={d} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
