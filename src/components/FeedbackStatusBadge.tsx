import type { FeedbackStatus } from "@/lib/types";

const STYLES: Record<FeedbackStatus, string> = {
  open: "bg-amber-100 text-amber-700",
  answered: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const LABELS: Record<FeedbackStatus, string> = {
  open: "대기중",
  answered: "답변완료",
  resolved: "해결됨",
};

export default function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
