import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { IncomeExpenseBar } from "@/components/charts/income-expense-bar";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickAddFab } from "@/components/dashboard/quick-add-fab";
import { getMonthName } from "@/lib/utils";
import { Calendar, TrendingUp } from "lucide-react";

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
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)
    .order("date", { ascending: false });

  const allTransactions = transactions || [];
  const totalIncome    = allTransactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses  = allTransactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const categorySpending = allTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      const name  = t.category?.name  || "Other";
      const color = t.category?.color || "#64748b";
      if (!acc[name]) acc[name] = { name, amount: 0, color };
      acc[name].amount += Number(t.amount);
      return acc;
    }, {} as Record<string, { name: string; amount: number; color: string }>);

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d      = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    const { data: mt } = await supabase
      .from("transactions").select("type, amount")
      .eq("user_id", user?.id ?? "").gte("date", mStart).lte("date", mEnd);
    const mInc  = (mt || []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const mExp  = (mt || []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    monthlyData.push({ month: getMonthName(d.getMonth() + 1).slice(0, 3), income: mInc, expenses: mExp });
  }

  const { data: recentTransactions } = await supabase
    .from("transactions").select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .order("date", { ascending: false }).limit(10);

  const monthLabel = `${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Month context strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <Calendar size={13} style={{ color: "var(--acid)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
            {monthLabel}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>
            Day {dayOfMonth} of {daysInMonth}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ width: "80px" }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${monthProgress}%`, backgroundColor: "var(--acid)" }} />
            </div>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--acid)", letterSpacing: "0.06em" }}>
            {monthProgress}%
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards totalIncome={totalIncome} totalExpenses={totalExpenses} currency={currency} />

      {/* Charts row */}
      <div>
        {/* Section label */}
        <div
          className="flex items-center gap-2 px-4 py-2 mb-px"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", borderBottom: "none" }}
        >
          <TrendingUp size={11} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            Spending Breakdown & 6-Month Trend
          </span>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-px"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div style={{ backgroundColor: "var(--surface)" }}>
            <SpendingPieChart data={Object.values(categorySpending)} currency={currency} />
          </div>
          <div style={{ backgroundColor: "var(--surface)" }}>
            <IncomeExpenseBar data={monthlyData} currency={currency} />
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <RecentTransactions transactions={recentTransactions || []} currency={currency} />

      <QuickAddFab />
    </div>
  );
}