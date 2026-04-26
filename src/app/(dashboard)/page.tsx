import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { IncomeExpenseBar } from "@/components/charts/income-expense-bar";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickAddFab } from "@/components/dashboard/quick-add-fab";
import { getMonthName } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user?.id ?? "")
    .single();

  const currency = profile?.currency || "USD";
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  // Get current month transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)
    .order("date", { ascending: false });

  const allTransactions = transactions || [];

  // Calculate summary
  const totalIncome = allTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = allTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

  // Spending by category
  const categorySpending = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const name = t.category?.name || "Other";
      const color = t.category?.color || "#64748b";
      if (!acc[name]) acc[name] = { name, amount: 0, color };
      acc[name].amount += Number(t.amount);
      return acc;
    }, {} as Record<string, { name: string; amount: number; color: string }>);

  // Last 6 months data for bar chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];

    const { data: mTransactions } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user?.id ?? "")
      .gte("date", mStart)
      .lte("date", mEnd);

    const mIncome = (mTransactions || []).filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const mExpenses = (mTransactions || []).filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    monthlyData.push({
      month: getMonthName(d.getMonth() + 1).slice(0, 3),
      income: mIncome,
      expenses: mExpenses,
    });
  }

  // Recent 10 transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .order("date", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <SummaryCards totalIncome={totalIncome} totalExpenses={totalExpenses} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingPieChart data={Object.values(categorySpending)} currency={currency} />
        <IncomeExpenseBar data={monthlyData} currency={currency} />
      </div>

      <RecentTransactions transactions={recentTransactions || []} currency={currency} />

      <QuickAddFab />
    </div>
  );
}