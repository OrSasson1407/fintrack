"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
}

export function SummaryCards({ totalIncome, totalExpenses, currency }: SummaryCardsProps) {
  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Income</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Expenses</p>
              <p className="text-2xl font-bold text-rose-600">
                {formatCurrency(totalExpenses, currency)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                {formatCurrency(balance, currency)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}