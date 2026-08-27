import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/SettingsForm";

export default async function AssemblySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("conflict_buffer_minutes")
    .eq("id", user!.id)
    .single();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">설정</h2>
      <SettingsForm defaultMinutes={profile?.conflict_buffer_minutes ?? 15} />
    </div>
  );
}
