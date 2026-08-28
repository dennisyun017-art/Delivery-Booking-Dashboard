"use client";

import { useRef, useState, useTransition } from "react";
import { submitFeedback } from "@/app/feedback/actions";

export default function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setSuccess(false);
        startTransition(async () => {
          try {
            await submitFeedback(formData);
            formRef.current?.reset();
            setSuccess(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "제출에 실패했습니다.");
          }
        });
      }}
      className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04)]"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-600">문의가 접수됐습니다. 확인 후 답변 드릴게요.</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-message" className="text-xs font-medium text-slate-600">
          내용
        </label>
        <textarea
          id="feedback-message"
          name="message"
          required
          rows={4}
          placeholder="오류 상황이나 문의 내용을 자세히 적어주세요"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-image" className="text-xs font-medium text-slate-600">
          캡처/사진 첨부 <span className="font-normal text-slate-400">(선택, 5MB 이하)</span>
        </label>
        <input
          id="feedback-image"
          name="image"
          type="file"
          accept="image/*"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {pending ? "제출 중..." : "제출하기"}
      </button>
    </form>
  );
}
