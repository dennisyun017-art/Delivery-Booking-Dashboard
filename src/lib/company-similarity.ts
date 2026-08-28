// Pure string comparison — no I/O — so it can run identically on the
// client (as-you-type) and could also run server-side if ever needed.

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/** Mirrors the Postgres generated column (profiles.company_name_key):
 * whitespace collapsed, common corporate suffixes stripped, lowercased. */
export function normalizeForCompare(name: string): string {
  return name
    .trim()
    .replace(/\(주\)|㈜|주식회사/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * Returns the closest existing company name if `input` looks like it might
 * be the same company under a different spelling — small edit distance, or
 * one name contains the other — or null if nothing looks related. Exact
 * normalized matches are skipped here since the database already hard-
 * blocks those; this is only for the softer "did you mean" warning.
 */
export function findSimilarCompanyName(input: string, existing: string[]): string | null {
  const key = normalizeForCompare(input);
  if (key.length < 2) return null;

  let best: { name: string; distance: number } | null = null;

  for (const name of existing) {
    const otherKey = normalizeForCompare(name);
    if (!otherKey || otherKey === key) continue;

    const maxLen = Math.max(key.length, otherKey.length);
    const isContained = maxLen >= 3 && (otherKey.includes(key) || key.includes(otherKey));
    const distance = levenshtein(key, otherKey);
    const isClose = distance / maxLen <= 0.34; // roughly "1 in 3 characters differ"

    if (isContained || isClose) {
      if (!best || distance < best.distance) best = { name, distance };
    }
  }

  return best?.name ?? null;
}
