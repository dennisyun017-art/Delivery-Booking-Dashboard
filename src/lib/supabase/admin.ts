import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key. Bypasses RLS.
 *
 * SERVER-ONLY. Never import this from a Client Component or expose the
 * service-role key to the browser. Used narrowly to look up a company's
 * login email (stored on `auth.users`, not `profiles`) so we can send
 * notification emails — never to bypass business rules on `deliveries`.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
