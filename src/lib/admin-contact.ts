import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** The operator's contact email, shown in the Nav of every partner
 * company's dashboard so they know who to reach for errors/questions.
 * Looks up whichever profile has role='admin' — this app assumes a single
 * admin/operator account. */
export async function getAdminContactEmail(): Promise<string | null> {
  const supabase = await createClient();
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!adminProfile) return null;

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(adminProfile.id);
  return data.user?.email ?? null;
}
