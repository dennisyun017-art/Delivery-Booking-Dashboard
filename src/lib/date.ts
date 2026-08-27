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
