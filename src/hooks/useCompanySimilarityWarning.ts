"use client";

import { useEffect, useState } from "react";
import { getCompanyNamesForSimilarityCheck } from "@/app/actions/company-names";
import { findSimilarCompanyName } from "@/lib/company-similarity";

/** Fetches the existing company-name roster once, then returns the closest
 * match for `companyName` if it looks like a near-duplicate — or null. */
export function useCompanySimilarityWarning(companyName: string): string | null {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCompanyNamesForSimilarityCheck().then((result) => {
      if (!cancelled) setNames(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = companyName.trim();
  if (trimmed.length < 2) return null;
  return findSimilarCompanyName(trimmed, names);
}
