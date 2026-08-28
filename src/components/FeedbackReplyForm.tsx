"use client";

import { useState, useTransition } from "react";
import { replyToFeedback } from "@/app/admin/feedback-actions";
import type { FeedbackStatus } from "@/lib/types";

export default function FeedbackReplyForm({
  id,
  defaultReply,
  defaultStatus,
}: {
  id: string;
  defaultReply: string;
  defaultStatus: FeedbackStatus;
}) {
  const [reply, setReply] = useState(defaultReply);
  const [status, setStatus] = useState<FeedbackStatus>(defaultStatus);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          try {
            await replyToFeedback(formData);
            setSaved(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
          }
        });
      }}
      className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50 p-3"
    >
      <input type="hidden" name="id" value={id} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && <p className="text-xs text-green-600">저장됐습니다.</p>}

      <textarea
        name="admin_reply"
        rows={2}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="답변을 입력해주세요 (선택)"
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        >
          <option value="open">대기중</option>
          <option value="answered">답변완료</option>
          <option value="resolved">해결됨</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
