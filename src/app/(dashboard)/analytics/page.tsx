import { createClient } from "@/lib/supabase/server";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { IncomeExpenseBar } from "@/components/charts/income-expense-bar";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { BarChart2, Layers, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles").select("currency").eq("id", user?.id ?? "").single();
  const currency = profile?.currency || "USD";
  const now = new Date();

  const monthlyData   = [];
  const expenseTrend  = [];
  const incomeTrend   = [];

  for (let i = 5; i >= 0; i--) {
    const d      = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    const label  = getMonthName(d.getMonth() + 1).slice(0, 3);
    const { data: mt } = await supabase.from("transactions").select("type, amount")
      .eq("user_id", user?.id ?? "").gte("date", mStart).lte("date", mEnd);
    const mInc = (mt || []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const mExp = (mt || []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    monthlyData.push({ month: label, income: mInc, expenses: mExp });
    expenseTrend.push({ label, amount: mExp });
    incomeTrend.push({ label, amount: mInc });
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: currentTransactions } = await supabase
    .from("transactions").select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "").eq("type", "expense")
    .gte("date", startOfMonth).lte("date", endOfMonth);

  const categorySpending = (currentTransactions || []).reduce((acc, t) => {
    const name  = t.category?.name  || "Other";
    const color = t.category?.color || "#64748b";
    if (!acc[name]) acc[name] = { name, amount: 0, color };
    acc[name].amount += Number(t.amount);
    return acc;
  }, {} as Record<string, { name: string; amount: number; color: string }>);

  const totalExpensesThisMonth = (currentTransactions || []).reduce((s, t) => s + Number(t.amount), 0);
  const totalTransactions      = (currentTransactions || []).length;
  const dailyAvg               = now.getDate() > 0 ? totalExpensesThisMonth / now.getDate() : 0;
  const topCategories          = Object.values(categorySpending).sort((a, b) => b.amount - a.amount).slice(0, 5);
  const monthLabel             = `${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`;

  const stats = [
    { code: "A", label: "Transactions", value: String(totalTransactions), sub: "this month", color: "var(--acid)", icon: Layers },
    { code: "B", label: "Total Spent",  value: formatCurrency(totalExpensesThisMonth, currency), sub: monthLabel, color: "var(--expense)", icon: ArrowDownRight },
    { code: "C", label: "Daily Avg",    value: formatCurrency(dailyAvg, currency), sub: "per day so far", color: "var(--warning)", icon: ArrowUpRight },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Stat cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-px"
        style={{ backgroundColor: "var(--border)" }}
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.code}
              className="animate-fade-in"
              style={{
                backgroundColor: "var(--surface)",
                padding: "1.25rem 1.5rem",
                animationDelay: `${i * 70}ms`,
                position: "relative",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                  05{s.code} / {s.label}
                </span>
                <div style={{ width: 28, height: 28, backgroundColor: "var(--surface-3)", border: `1px solid var(--border)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={13} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: s.color, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums", marginBottom: "0.25rem" }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-tertiary)", letterSpacing: "0.04em" }}>
                {s.sub}
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", backgroundColor: s.color, opacity: 0.35 }} />
            </div>
          );
        })}
      </div>

      {/* Charts — income vs expense + pie */}
      <div>
        <div
          className="flex items-center gap-2 px-4 py-2 mb-px"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", borderBottom: "none" }}
        >
          <BarChart2 size={11} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            6-Month Overview & Category Breakdown
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "var(--border)" }}>
          <div style={{ backgroundColor: "var(--surface)" }}><IncomeExpenseBar data={monthlyData} currency={currency} /></div>
          <div style={{ backgroundColor: "var(--surface)" }}><SpendingPieChart data={Object.values(categorySpending)} currency={currency} /></div>
        </div>
      </div>

      {/* Trend charts */}
      <div>
        <div
          className="flex items-center gap-2 px-4 py-2 mb-px"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", borderBottom: "none" }}
        >
          <Activity size={11} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            Trend Lines
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "var(--border)" }}>
          <div style={{ backgroundColor: "var(--surface)" }}>
            <TrendLineChart data={expenseTrend} title="Expense Trend" color="#FF4455" currency={currency} />
          </div>
          <div style={{ backgroundColor: "var(--surface)" }}>
            <TrendLineChart data={incomeTrend} title="Income Trend" color="#00FF88" currency={currency} />
          </div>
        </div>
      </div>

      {/* Top categories */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>05D /</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
            Top Spending Categories
          </span>
          <span className="tag tag-muted ml-auto">{monthLabel}</span>
        </div>

        {topCategories.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
            No expense data this month
          </div>
        ) : (
          <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {topCategories.map((c, i) => {
              const pct = totalExpensesThisMonth > 0 ? (c.amount / totalExpensesThisMonth) * 100 : 0;
              return (
                <div key={c.name} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-tertiary)", opacity: 0.4, minWidth: "24px", lineHeight: 1 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ width: 8, height: 8, backgroundColor: c.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-tertiary)" }}>
                        {pct.toFixed(1)}%
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--expense)", fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(c.amount, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}