import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { IncomeExpenseBar } from "@/components/charts/income-expense-bar";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickAddFab } from "@/components/dashboard/quick-add-fab";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { InsightsStrip } from "@/components/dashboard/insights-strip";
import { getMonthName } from "@/lib/utils";
import { Activity } from "lucide-react";

type CategorySpending = {
  name: string;
  amount: number;
  color: string;
};

type Transaction = {
  id?: string;
  type: "income" | "expense";
  amount: number | string;
  date: string;
  category?: {
    name: string;
    color: string;
  } | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user?.id ?? "")
    .single();

  const currency = profile?.currency || "USD";

  // Next 15 searchParams
  const params = await searchParams;

  let targetDate = new Date();

  if (params.month) {
    const [y, m] = params.month.split("-").map(Number);

    if (!isNaN(y) && !isNaN(m)) {
      targetDate = new Date(y, m - 1, 1);
    }
  }

  const startOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const endOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)
    .order("date", { ascending: false });

  const allTransactions: Transaction[] = (transactions || []) as Transaction[];

  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Category spending breakdown
  const categorySpending = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const name = t.category?.name || "Other";
      const color = t.category?.color || "#64748b";

      if (!acc[name]) {
        acc[name] = {
          name,
          amount: 0,
          color,
        };
      }

      acc[name].amount += Number(t.amount);

      return acc;
    }, {} as Record<string, CategorySpending>);

  // 6 Month Data
  const monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() - i,
      1
    );

    const mStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      1
    ).toISOString().split("T")[0];

    const mEnd = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    ).toISOString().split("T")[0];

    const { data: mt } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user?.id ?? "")
      .gte("date", mStart)
      .lte("date", mEnd);

    const monthTx = (mt || []) as Pick<Transaction, "type" | "amount">[];

    const mIncome = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);

    const mExpenses = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    monthlyData.push({
      month: getMonthName(d.getMonth() + 1).slice(0, 3),
      income: mIncome,
      expenses: mExpenses,
    });
  }

  // Cumulative net worth trend
  let runningNet = 0;

  const netWorthData = monthlyData.map((d) => {
    runningNet += d.income - d.expenses;

    return {
      label: d.month,
      amount: runningNet,
    };
  });

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .order("date", { ascending: false })
    .limit(10);

  const monthLabel = `${getMonthName(
    targetDate.getMonth() + 1
  )} ${targetDate.getFullYear()}`;

  // Previous month comparison
  const prevMonthStart = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() - 1,
    1
  )
    .toISOString()
    .split("T")[0];

  const prevMonthEnd = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    0
  )
    .toISOString()
    .split("T")[0];

  const { data: prevTxs } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user?.id ?? "")
    .gte("date", prevMonthStart)
    .lte("date", prevMonthEnd);

  const previousMonthTx = (prevTxs || []) as Pick<
    Transaction,
    "type" | "amount"
  >[];

  const previousIncome = previousMonthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const previousExpenses = previousMonthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  // Insights
  const insights: {
    text: string;
    type: "positive" | "negative" | "info";
  }[] = [];

  if (previousExpenses > 0) {
    const expenseDiff =
      ((totalExpenses - previousExpenses) / previousExpenses) * 100;

    if (expenseDiff > 5) {
      insights.push({
        text: `Spending up ${expenseDiff.toFixed(1)}% vs last month`,
        type: "negative",
      });
    } else if (expenseDiff < -5) {
      insights.push({
        text: `Spending down ${Math.abs(expenseDiff).toFixed(1)}% vs last month`,
        type: "positive",
      });
    }
  }

  const bestMonth = [...monthlyData].sort(
    (a, b) =>
      b.income -
      b.expenses -
      (a.income - a.expenses)
  )[0];

  if (bestMonth && bestMonth.income - bestMonth.expenses > 0) {
    insights.push({
      text: `Best saved month: ${bestMonth.month}`,
      type: "positive",
    });
  }

  // FIXED unknown typing issue here
  const sortedCategories: CategorySpending[] =
    Object.values(categorySpending);

  sortedCategories.sort(
    (a, b) => b.amount - a.amount
  );

  if (sortedCategories.length > 0) {
    insights.push({
      text: `Highest spend: ${sortedCategories[0].name}`,
      type: "info",
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <MonthSelector
          currentMonth={targetDate.getMonth() + 1}
          currentYear={targetDate.getFullYear()}
          monthLabel={monthLabel}
        />

        <InsightsStrip insights={insights} />
      </div>

      {/* Summary */}
      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        currency={currency}
        previousIncome={previousIncome}
        previousExpenses={previousExpenses}
      />

      {/* Charts */}
      <div>
        <div
          className="flex items-center gap-2 px-4 py-2 mb-px"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderBottom: "none",
          }}
        >
          <Activity
            size={12}
            style={{
              color: "var(--text-tertiary)",
            }}
          />

          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            Financial Overview & Trends
          </span>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-px"
          style={{
            backgroundColor: "var(--border)",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              height: "300px",
            }}
          >
            <SpendingPieChart
              data={Object.values(categorySpending)}
              currency={currency}
            />
          </div>

          <div
            style={{
              backgroundColor: "var(--surface)",
              height: "300px",
            }}
          >
            <IncomeExpenseBar
              data={monthlyData}
              currency={currency}
            />
          </div>

          <div
            className="p-4"
            style={{
              backgroundColor: "var(--surface)",
              height: "300px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                }}
              >
                Cumulative Net Worth (6M)
              </span>
            </div>

            <div className="h-[220px]">
              <TrendLineChart
                data={netWorthData}
                title="Cumulative Net"
                color="var(--acid)"
                currency={currency}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent */}
      <RecentTransactions
        transactions={recentTransactions || []}
        currency={currency}
      />

      <QuickAddFab />
    </div>
  );
}