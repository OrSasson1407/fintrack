import { createClient } from "@/lib/supabase/server";
import { getCurrentMonth, getCurrentYear } from "@/lib/utils";
import { BudgetsClient } from "./budgets-client";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const month = getCurrentMonth();
  const year = getCurrentYear();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user?.id ?? "")
    .single();

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .eq("month", month)
    .eq("year", year);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("type", "expense")
    .order("name");

  // Calculate spent per category for current month
  const startOfMonth = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endOfMonth = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("category_id, amount")
    .eq("user_id", user?.id ?? "")
    .eq("type", "expense")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth);

  const spentByCategory: Record<string, number> = {};
  (transactions || []).forEach((t) => {
    spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + Number(t.amount);
  });

  const budgetsWithSpent = (budgets || []).map((b) => ({
    ...b,
    spent: spentByCategory[b.category_id] || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budgets</h1>
      <BudgetsClient
        budgets={budgetsWithSpent}
        categories={categories || []}
        currency={profile?.currency || "USD"}
        userId={user?.id ?? ""}
        month={month}
        year={year}
      />
    </div>
  );
}