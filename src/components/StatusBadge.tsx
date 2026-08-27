import type { DeliveryStatus } from "@/lib/types";

const STYLES: Record<DeliveryStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const LABELS: Record<DeliveryStatus, string> = {
  pending: "대기중",
  approved: "승인됨",
  rejected: "반려됨",
};

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
