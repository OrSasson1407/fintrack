import { createClient } from "@/lib/supabase/server";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user?.id ?? "")
    .single();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("is_completed", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Savings Goals</h1>
      <GoalsClient
        goals={goals || []}
        currency={profile?.currency || "USD"}
        userId={user?.id ?? ""}
      />
    </div>
  );
}