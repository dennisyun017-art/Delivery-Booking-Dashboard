"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Returns every registered company name (assembly + delivery), nothing
 * else. Deliberately unauthenticated — the public signup page needs this
 * to warn "is this the same company as X?" before an account exists to
 * authenticate with. Company names aren't sensitive; only names are
 * returned here, never emails or other profile fields.
 */
export async function getCompanyNamesForSimilarityCheck(): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("company_name").neq("role", "admin");
  return (data ?? []).map((row) => row.company_name);
}
