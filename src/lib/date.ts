// Local-date helpers. Deliberately avoid toISOString() for date-only
// formatting — it converts to UTC first, which shifts the calendar day
// backward in any timezone ahead of UTC (e.g. KST, UTC+9).

export function dateOnly(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dateOnly(d);
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * A 3-week (21 day), Sunday-start calendar grid centered on `today`'s week
 * (previous week, this week, next week).
 */
export function buildThreeWeekGrid(today: string): string[] {
  const d = new Date(today + "T00:00:00");
  const dayOfWeek = d.getDay(); // 0 = Sunday
  const gridStart = addDays(today, -dayOfWeek - 7);
  return Array.from({ length: 21 }, (_, i) => addDays(gridStart, i));
}

export function weekdayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return WEEKDAY_LABELS[d.getDay()];
}

export function formatMonthDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdayLabel(dateStr)})`;
}

/** Heading for a calendar grid spanning `dates` — "2026년 8월" if it stays
 * within one month, "2026년 8월 - 9월" or "2025년 12월 - 2026년 1월" if it
 * crosses a month/year boundary. */
export function formatYearMonthRange(dates: string[]): string {
  const first = new Date(dates[0] + "T00:00:00");
  const last = new Date(dates[dates.length - 1] + "T00:00:00");
  const firstLabel = `${first.getFullYear()}년 ${first.getMonth() + 1}월`;
  if (first.getFullYear() === last.getFullYear() && first.getMonth() === last.getMonth()) {
    return firstLabel;
  }
  const lastLabel =
    first.getFullYear() === last.getFullYear()
      ? `${last.getMonth() + 1}월`
      : `${last.getFullYear()}년 ${last.getMonth() + 1}월`;
  return `${firstLabel} - ${lastLabel}`;
}
