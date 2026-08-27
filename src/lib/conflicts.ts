import type { Delivery } from "./types";

/**
 * Returns the ids of deliveries whose requested_at falls within `bufferMinutes`
 * of another non-rejected delivery to the same assembly company.
 *
 * Assumes all `deliveries` already belong to a single assembly company / day;
 * callers are responsible for scoping the query before calling this.
 */
export function findConflictingIds(
  deliveries: Delivery[],
  bufferMinutes: number,
): Set<string> {
  const active = deliveries
    .filter((d) => d.status !== "rejected")
    .slice()
    .sort(
      (a, b) =>
        new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
    );

  const conflicts = new Set<string>();
  const bufferMs = bufferMinutes * 60_000;

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const diff =
        new Date(active[j].requested_at).getTime() -
        new Date(active[i].requested_at).getTime();
      if (diff <= bufferMs) {
        conflicts.add(active[i].id);
        conflicts.add(active[j].id);
      } else {
        // sorted by time, so nothing further out will be closer
        break;
      }
    }
  }

  return conflicts;
}
