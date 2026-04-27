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
  Download,
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
  
  // Bulk selection & export state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  // Calculate running balances (processes oldest to newest because DB returns newest first)
  const runningBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    let currentBalance = 0;
    for (let i = transactions.length - 1; i >= 0; i--) {
      const t = transactions[i];
      if (t.type === "income") {
        currentBalance += t.amount;
      } else {
        currentBalance -= t.amount;
      }
      balances[t.id] = currentBalance;
    }
    return balances;
  }, [transactions]);

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

  // --- Handlers ---
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("transactions").delete().eq("id", id);
    setDeletingId(null);
    setConfirmId(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    router.refresh();
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    await supabase.from("transactions").delete().in("id", idsToDelete);
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
    setIsBulkDeleting(false);
    router.refresh();
  };

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount", "Running Balance"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(t => {
        return [
          new Date(t.date).toISOString().split('T')[0],
          `"${(t.description || t.category?.name || "Untitled").replace(/"/g, '""')}"`,
          `"${(t.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
          t.type,
          t.amount.toString(),
          (runningBalances[t.id] || 0).toString()
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(t => t.id)));
    }
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
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            className="btn-ghost flex items-center gap-2 py-2 px-3 shadow-sm hover:text-white"
            title="Export filtered transactions to CSV"
          >
            <Download size={14} strokeWidth={2} />
            <span className="font-semibold tracking-wide text-xs uppercase hidden sm:inline-block">Export</span>
          </button>
          <button
            className="btn-acid flex items-center gap-2 py-2 px-4 shadow-sm transition-transform hover:scale-105"
            onClick={() => { setEditTransaction(null); setShowForm(true); }}
          >
            <Plus size={14} strokeWidth={3} />
            <span className="font-semibold tracking-wide text-xs uppercase">New</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {showBulkConfirm ? (
        <div className="bg-red-950/40 border border-red-500/50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500 animate-pulse" />
            <span className="text-sm font-mono text-expense font-bold">
              Permanently delete {selectedIds.size} transaction{selectedIds.size > 1 ? "s" : ""}?
            </span>
          </div>
          <div className="flex gap-3 self-end sm:self-auto">
            <button onClick={() => setShowBulkConfirm(false)} className="btn-ghost text-xs">Cancel</button>
            <button 
              onClick={handleBulkDelete} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      ) : selectedIds.size > 0 ? (
        <div className="bg-surface-2 border border-border p-3 rounded-lg flex items-center justify-between animate-fade-in shadow-md">
          <span className="text-sm font-mono text-acid font-semibold bg-acid/10 px-3 py-1 rounded-md">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedIds(new Set())} className="text-xs font-mono uppercase text-text-tertiary hover:text-text-primary transition-colors">
              Clear
            </button>
            <button 
              onClick={() => setShowBulkConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded border border-red-500/20 text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      ) : null}

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
            className="hidden sm:grid px-6 py-3 items-center"
            style={{
              gridTemplateColumns: "30px 1fr 110px 110px 120px 80px",
              backgroundColor: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex justify-center">
              <input 
                type="checkbox" 
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="accent-acid w-3.5 h-3.5 rounded border-border bg-surface cursor-pointer"
                title="Select all"
              />
            </div>
            {["Transaction Details", "Date", "Amount", "Balance", ""].map((h, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  textAlign: i >= 2 && i <= 3 ? "right" : "left",
                  paddingLeft: i === 0 ? "0.5rem" : "0",
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
                    const isConfirming = confirmId === t.id;
                    const isDeleting = deletingId === t.id;
                    const isLastInGroup = i === txs.length - 1;
                    const isSelected = selectedIds.has(t.id);

                    return (
                      <li
                        key={t.id}
                        className={`animate-fade-in group transition-colors ${isSelected ? "bg-acid/5" : ""}`}
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
                            style={{ gridTemplateColumns: "30px 1fr 110px 110px 120px 80px" }}
                          >
                            {/* Checkbox */}
                            <div className="flex justify-center">
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(t.id)}
                                className="accent-acid w-3.5 h-3.5 rounded border-border bg-surface cursor-pointer"
                              />
                            </div>

                            {/* Description & Category Indicator */}
                            <div className="flex items-center gap-3 min-w-0 pl-2">
                              <div 
                                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
                                style={{ backgroundColor: `${t.category?.color || "var(--text-tertiary)"}15` }}
                              >
                                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: t.category?.color || "var(--text-tertiary)" }} />
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

                            {/* Running Balance */}
                            <div className="flex items-center gap-1.5 justify-end">
                              <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                color: "var(--text-secondary)",
                                fontVariantNumeric: "tabular-nums",
                              }}>
                                {formatCurrency(runningBalances[t.id] || 0, currency)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditTransaction(t); setShowForm(true); }}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setConfirmId(t.id)}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-all"
                                title="Delete"
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