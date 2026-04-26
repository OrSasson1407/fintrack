"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionFilters } from "./transaction-filters";
import { TransactionForm } from "@/components/forms/transaction-form";
import type { Transaction, Category } from "@/types";
import { Pencil, Trash2, Plus } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  userId: string;
}

export function TransactionList({ transactions, categories, currency, userId }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || t.category_id === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
        />
        <Button onClick={() => { setEditTransaction(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Transaction
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            {transactions.length === 0
              ? "No transactions yet. Add your first one!"
              : "No transactions match your filters."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: t.category?.color || "#6366f1" }}
                    >
                      {(t.category?.name || "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.category?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">
                        {t.description ? `${t.description} · ` : ""}{formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditTransaction(t); setShowForm(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditTransaction(null); }}
        categories={categories}
        editTransaction={editTransaction}
        userId={userId}
      />
    </div>
  );
}