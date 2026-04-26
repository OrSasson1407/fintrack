import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";
import type { Profile } from "@/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsClient
        profile={profile as Profile}
        email={user?.email ?? ""}
      />
    </div>
  );
}