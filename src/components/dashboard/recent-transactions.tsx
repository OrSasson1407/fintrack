"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-slate-400">
          No transactions yet. Add your first one!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: t.category?.color || "#6366f1" }}
              >
                {(t.category?.name || "?")[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{t.category?.name || "Unknown"}</p>
                <p className="text-xs text-slate-500">{t.description || formatDate(t.date)}</p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
              {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}