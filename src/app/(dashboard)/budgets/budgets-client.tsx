"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BudgetForm } from "@/components/forms/budget-form";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Budget, Category } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface BudgetsClientProps {
  budgets: (Budget & { spent: number })[];
  categories: Category[];
  currency: string;
  userId: string;
  month: number;
  year: number;
}

export function BudgetsClient({ budgets, categories, currency, userId, month, year }: BudgetsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    await supabase.from("budgets").delete().eq("id", id);
    router.refresh();
  };

  const getProgressColor = (spent: number, budget: number) => {
    const ratio = spent / budget;
    if (ratio >= 1) return "bg-rose-600";
    if (ratio >= 0.8) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500">{getMonthName(month)} {year}</p>
        <Button onClick={() => { setEditBudget(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Set Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            No budgets set for this month. Click &quot;Set Budget&quot; to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const percentage = Math.min((b.spent / b.amount) * 100, 100);
            const remaining = b.amount - b.spent;
            return (
              <Card key={b.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: b.category?.color || "#6366f1" }}
                      >
                        {(b.category?.name || "?")[0]}
                      </div>
                      <span className="font-medium">{b.category?.name || "Unknown"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditBudget(b); setShowForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {formatCurrency(b.spent, currency)} of {formatCurrency(b.amount, currency)}
                      </span>
                      <span className={`font-medium ${remaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {remaining < 0 ? `Over by ${formatCurrency(Math.abs(remaining), currency)}` : `${formatCurrency(remaining, currency)} left`}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(b.spent, b.amount)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditBudget(null); }}
        categories={categories}
        editBudget={editBudget}
        userId={userId}
      />
    </div>
  );
}