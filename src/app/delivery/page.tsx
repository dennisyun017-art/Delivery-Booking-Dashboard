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
      .select("id, company_name")
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
        <h2 className="mb-3 text-lg font-semibold">새 납품 예약</h2>
        <NewDeliveryForm assemblyCompanies={assemblyCompanies ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">내 예약 목록</h2>
        <div className="flex flex-col gap-3">
          {(deliveries ?? []).length === 0 && (
            <p className="text-sm text-gray-500">등록된 예약이 없습니다.</p>
          )}
          {(deliveries as Delivery[] | null)?.map((d) => (
            <div key={d.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">
                  {assemblyMap.get(d.assembly_company_id) ?? "알 수 없음"}
                </p>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(d.requested_at).toLocaleString("ko-KR")}
              </p>
              {d.note && <p className="mt-1 text-sm text-gray-500">{d.note}</p>}

              {d.status === "rejected" && (
                <div className="mt-3 rounded-md bg-red-50 p-3">
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
