import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--obsidian)" }}
    >
      <Sidebar />
      {/* Offset main content so it doesn't sit under the fixed sidebar */}
      <div className="flex flex-col min-h-screen md:pl-[220px]">
        <Topbar
          fullName={profile?.full_name ?? null}
          email={user.email ?? ""}
        />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}