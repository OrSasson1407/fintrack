import { createClient } from "@/lib/supabase/server";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { IncomeExpenseBar } from "@/components/charts/income-expense-bar";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthName } from "@/lib/utils";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user?.id ?? "")
    .single();

  const currency = profile?.currency || "USD";
  const now = new Date();

  // Last 6 months data
  const monthlyData = [];
  const expenseTrend = [];
  const incomeTrend = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    const monthLabel = getMonthName(d.getMonth() + 1).slice(0, 3);

    const { data: mTransactions } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user?.id ?? "")
      .gte("date", mStart)
      .lte("date", mEnd);

    const mIncome = (mTransactions || []).filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const mExpenses = (mTransactions || []).filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    monthlyData.push({ month: monthLabel, income: mIncome, expenses: mExpenses });
    expenseTrend.push({ label: monthLabel, amount: mExpenses });
    incomeTrend.push({ label: monthLabel, amount: mIncome });
  }

  // Current month category breakdown
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: currentTransactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .eq("type", "expense")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth);

  const categorySpending = (currentTransactions || []).reduce((acc, t) => {
    const name = t.category?.name || "Other";
    const color = t.category?.color || "#64748b";
    if (!acc[name]) acc[name] = { name, amount: 0, color };
    acc[name].amount += Number(t.amount);
    return acc;
  }, {} as Record<string, { name: string; amount: number; color: string }>);

  // Stats
  const totalTransactions = (currentTransactions || []).length;
  const totalExpensesThisMonth = (currentTransactions || []).reduce((s, t) => s + Number(t.amount), 0);
  const dailyAvg = now.getDate() > 0 ? totalExpensesThisMonth / now.getDate() : 0;

  // Top spending categories
  const topCategories = Object.values(categorySpending).sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Transactions This Month</p>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total Spent This Month</p>
            <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalExpensesThisMonth, currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Daily Average Spending</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(dailyAvg, currency)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseBar data={monthlyData} currency={currency} />
        <SpendingPieChart data={Object.values(categorySpending)} currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendLineChart data={expenseTrend} title="Expense Trend" color="#f43f5e" currency={currency} />
        <TrendLineChart data={incomeTrend} title="Income Trend" color="#10b981" currency={currency} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No expense data this month</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">{i + 1}</span>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(c.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}