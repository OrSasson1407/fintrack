"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionFilters } from "./transaction-filters";
import { TransactionForm } from "@/components/forms/transaction-form";
import type { Transaction, Category } from "@/types";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  userId: string;
}

export function TransactionList({
  transactions,
  categories,
  currency,
  userId,
}: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Auto-open form if triggered by the Quick Add FAB
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowForm(true);
      router.replace("/transactions", { scroll: false });
    }
  }, [searchParams, router]);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || t.category_id === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Group transactions logically
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach((t) => {
      const d = new Date(t.date);
      let groupName = "";

      if (d.toDateString() === today.toDateString()) {
        groupName = "Today";
      } else if (d.toDateString() === yesterday.toDateString()) {
        groupName = "Yesterday";
      } else {
        const diffTime = Math.abs(today.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          groupName = "Last 7 Days";
        } else if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
          groupName = "Earlier This Month";
        } else {
          groupName = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }
      }

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(t);
    });

    return groups;
  }, [filtered]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("transactions").delete().eq("id", id);
    setDeletingId(null);
    setConfirmId(null);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
        />
        <button
          className="btn-acid flex items-center gap-2 self-start sm:self-auto py-2 px-4 shadow-sm transition-transform hover:scale-105"
          onClick={() => { setEditTransaction(null); setShowForm(true); }}
        >
          <Plus size={14} strokeWidth={3} />
          <span className="font-semibold tracking-wide text-xs uppercase">New Transaction</span>
        </button>
      </div>

      {/* Results count */}
      {transactions.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-tertiary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Showing {filtered.length} of {transactions.length}
          </span>
          {filtered.length !== transactions.length && (
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); setCategoryFilter("all"); }}
              className="text-[0.6rem] text-rose-500 hover:text-rose-400 underline underline-offset-2 font-mono uppercase tracking-widest transition-colors"
            >
              clear filters
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", borderRadius: "0.5rem" }}>
          <div className="p-4 rounded-full" style={{ backgroundColor: "var(--surface-2)" }}>
            <Inbox size={32} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div className="text-center">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              {transactions.length === 0 ? "No transactions yet" : "No matches found"}
            </h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
              {transactions.length === 0 ? "Add your first transaction to get started" : "Try adjusting your filters"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          {/* Table header */}
          <div
            className="hidden sm:grid px-6 py-3"
            style={{
              gridTemplateColumns: "1fr 130px 140px 90px",
              backgroundColor: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {["Transaction Details", "Date", "Amount", ""].map((h, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  textAlign: i === 2 ? "right" : "left",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Grouped Rows */}
          <div className="flex flex-col">
            {Object.entries(groupedTransactions).map(([group, txs]) => (
              <div key={group} className="flex flex-col">
                {/* Group Header */}
                <div 
                  className="px-6 py-2 flex items-center gap-2 sticky top-0 z-10 backdrop-blur-md"
                  style={{ backgroundColor: "rgba(var(--surface-2-rgb), 0.8)", borderBottom: "1px solid var(--border)", borderTop: group === "Today" ? "none" : "1px solid var(--border)" }}
                >
                  <CalendarDays size={12} style={{ color: "var(--text-tertiary)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    {group}
                  </span>
                </div>

                <ul>
                  {txs.map((t, i) => {
                    const isIncome = t.type === "income";
                    const Arrow = isIncome ? ArrowUpRight : ArrowDownRight;
                    const isConfirming = confirmId === t.id;
                    const isDeleting = deletingId === t.id;
                    const isLastInGroup = i === txs.length - 1;

                    return (
                      <li
                        key={t.id}
                        className="animate-fade-in group"
                        style={{ borderBottom: isLastInGroup ? "none" : "1px solid var(--border)", animationDelay: `${i * 20}ms` }}
                      >
                        {isConfirming ? (
                          <div className="flex items-center justify-between px-6 py-4 bg-red-950/20">
                            <div className="flex items-center gap-3">
                              <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--expense)" }}>
                                Delete this transaction permanently?
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => setConfirmId(null)} className="text-xs text-muted-foreground hover:text-white transition-colors">
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
                              >
                                {isDeleting ? "..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="grid sm:grid items-center px-6 py-4 gap-4 transition-all duration-200 hover:bg-white/5"
                            style={{ gridTemplateColumns: "1fr 130px 140px 90px" }}
                          >
                            {/* Description & Category Indicator */}
                            <div className="flex items-center gap-4 min-w-0">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
                                style={{ backgroundColor: `${t.category?.color || "var(--text-tertiary)"}15` }}
                              >
                                <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: t.category?.color || "var(--text-tertiary)" }} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                  {t.description || t.category?.name || "Untitled"}
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                                  {t.category?.name || "Uncategorized"}
                                </div>
                              </div>
                            </div>

                            {/* Date */}
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
                              {formatDate(t.date)}
                            </span>

                            {/* Amount */}
                            <div className="flex items-center gap-1.5 justify-end">
                              <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: isIncome ? "var(--income)" : "var(--text-primary)",
                                fontVariantNumeric: "tabular-nums",
                              }}>
                                {isIncome ? "+" : "-"}{formatCurrency(t.amount, currency)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditTransaction(t); setShowForm(true); }}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setConfirmId(t.id)}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
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