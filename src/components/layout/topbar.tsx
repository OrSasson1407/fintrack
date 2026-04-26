import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export async function Topbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6">
      <MobileNav />
      <div className="flex-1" />
      <UserMenu
        fullName={profile?.full_name ?? null}
        email={user?.email ?? ""}
      />
    </header>
  );
}