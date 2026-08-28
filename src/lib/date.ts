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

/** Shifts to the 1st of the month `n` months away from `dateStr`. Only the
 * year/month of the result matters to callers (it's used as a grid center),
 * so anchoring to day 1 sidesteps day-overflow issues (e.g. Aug 31 + 1
 * month rolling into October instead of September). */
export function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  return dateOnly(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * A Sunday-start calendar grid covering the full month that `centerDate`
 * falls in, padded with the leading/trailing days of the adjacent months
 * needed to fill out whole weeks (the usual month-calendar look).
 */
export function buildMonthGrid(centerDate: string): string[] {
  const d = new Date(centerDate + "T00:00:00");
  const firstOfMonth = dateOnly(new Date(d.getFullYear(), d.getMonth(), 1));
  const lastOfMonth = dateOnly(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  const gridStart = addDays(firstOfMonth, -new Date(firstOfMonth + "T00:00:00").getDay());
  const gridEnd = addDays(lastOfMonth, 6 - new Date(lastOfMonth + "T00:00:00").getDay());

  const dates: string[] = [];
  for (let cur = gridStart; cur <= gridEnd; cur = addDays(cur, 1)) {
    dates.push(cur);
  }
  return dates;
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

/** Heading for a month-grid view — "2026년 8월", regardless of the leading/
 * trailing days from adjacent months that pad the grid out to whole weeks. */
export function formatMonthLabel(centerDate: string): string {
  const d = new Date(centerDate + "T00:00:00");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}
