import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import DecisionForm from "@/components/DecisionForm";
import { findConflictingIds } from "@/lib/conflicts";
import type { Delivery } from "@/lib/types";

function dateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dateOnly(d);
}

export default async function AssemblyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const day = date || dateOnly(new Date());

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("conflict_buffer_minutes")
    .eq("id", user!.id)
    .single();

  const start = new Date(day + "T00:00:00").toISOString();
  const end = new Date(day + "T23:59:59.999").toISOString();

  const [{ data: deliveryCompanies }, { data: deliveries }] = await Promise.all([
    supabase.from("profiles").select("id, company_name").eq("role", "delivery"),
    supabase
      .from("deliveries")
      .select("*")
      .eq("assembly_company_id", user!.id)
      .gte("requested_at", start)
      .lte("requested_at", end)
      .order("requested_at", { ascending: true }),
  ]);

  const companyMap = new Map((deliveryCompanies ?? []).map((c) => [c.id, c.company_name]));
  const bufferMinutes = myProfile?.conflict_buffer_minutes ?? 15;
  const conflicts = findConflictingIds((deliveries ?? []) as Delivery[], bufferMinutes);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href={`/assembly?date=${addDays(day, -1)}`} className="rounded-md border px-3 py-1 text-sm">
          ◀ 이전
        </Link>
        <div className="text-center">
          <p className="font-semibold">{day}</p>
          <p className="text-xs text-gray-500">겹침 기준 {bufferMinutes}분</p>
        </div>
        <Link href={`/assembly?date=${addDays(day, 1)}`} className="rounded-md border px-3 py-1 text-sm">
          다음 ▶
        </Link>
      </div>

      {conflicts.size > 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          ⚠️ {conflicts.size}건이 다른 예약과 {bufferMinutes}분 이내로 겹칩니다.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {(deliveries ?? []).length === 0 && (
          <p className="text-sm text-gray-500">이 날짜에 등록된 예약이 없습니다.</p>
        )}
        {(deliveries as Delivery[] | null)?.map((d) => (
          <div
            key={d.id}
            className={`rounded-lg border bg-white p-4 shadow-sm ${
              conflicts.has(d.id) ? "border-amber-400 bg-amber-50" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {companyMap.get(d.delivery_company_id) ?? "알 수 없음"}
              </p>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {new Date(d.requested_at).toLocaleString("ko-KR")}
            </p>
            {d.note && <p className="mt-1 text-sm text-gray-500">{d.note}</p>}
            {conflicts.has(d.id) && (
              <p className="mt-1 text-xs font-medium text-amber-700">
                다른 예약과 시간이 겹칩니다
              </p>
            )}

            {d.status === "pending" && <DecisionForm deliveryId={d.id} />}
            {d.status === "rejected" && d.reject_reason && (
              <p className="mt-2 text-sm text-gray-500">반려 사유: {d.reject_reason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
