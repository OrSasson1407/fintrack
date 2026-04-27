"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    setDeletingId(id);
    await supabase.from("transactions").delete().eq("id", id);
    setDeletingId(null);
    setConfirmId(null);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Toolbar */}
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
        <button
          className="btn-acid flex items-center gap-1.5 self-start sm:self-auto"
          onClick={() => { setEditTransaction(null); setShowForm(true); }}
        >
          <Plus size={12} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Results count */}
      {transactions.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Showing {filtered.length} of {transactions.length} transactions
          </span>
          {filtered.length !== transactions.length && (
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); setCategoryFilter("all"); }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.52rem",
                color: "var(--acid)",
                letterSpacing: "0.06em",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              clear filters
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "3.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Inbox size={28} style={{ color: "var(--text-tertiary)" }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>
            {transactions.length === 0 ? "No transactions yet" : "No matches found"}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--text-tertiary)",
          }}>
            {transactions.length === 0
              ? "Add your first transaction to get started"
              : "Try adjusting your filters"}
          </span>
        </div>
      ) : (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          {/* Table header */}
          <div
            className="hidden sm:grid px-5 py-2.5"
            style={{
              gridTemplateColumns: "1fr 130px 140px 90px",
              backgroundColor: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {["Description / Category", "Date", "Amount", ""].map((h, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.46rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  textAlign: i === 2 ? "right" : "left",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <ul>
            {filtered.map((t, i) => {
              const isIncome = t.type === "income";
              const Arrow = isIncome ? ArrowUpRight : ArrowDownRight;
              const isConfirming = confirmId === t.id;
              const isDeleting = deletingId === t.id;

              return (
                <li
                  key={t.id}
                  className="animate-fade-in"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    animationDelay: `${i * 30}ms`,
                  }}
                >
                  {isConfirming ? (
                    /* Inline delete confirm */
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ backgroundColor: "var(--expense-bg)" }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={13} style={{ color: "var(--expense)" }} />
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          color: "var(--expense)",
                          letterSpacing: "0.04em",
                        }}>
                          Delete this transaction?
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="btn-ghost"
                          style={{ padding: "0.3rem 0.8rem", fontSize: "0.58rem" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={isDeleting}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.58rem",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "0.3rem 0.8rem",
                            backgroundColor: "var(--expense)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--expense)",
                            cursor: "pointer",
                            opacity: isDeleting ? 0.6 : 1,
                          }}
                        >
                          {isDeleting ? "Deleting…" : "Confirm"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal row */
                    <div
                      className="grid sm:grid items-center px-5 py-3 gap-3 transition-colors duration-100"
                      style={{ gridTemplateColumns: "1fr 130px 140px 90px" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                    >
                      {/* Description */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div style={{
                          width: 8,
                          height: 8,
                          flexShrink: 0,
                          backgroundColor: t.category?.color || "var(--text-tertiary)",
                        }} />
                        <div className="min-w-0">
                          <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {t.description || t.category?.name || "Untitled"}
                          </div>
                          <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.52rem",
                            color: "var(--text-tertiary)",
                            marginTop: "1px",
                          }}>
                            {t.category?.name || "—"}
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "var(--text-tertiary)",
                        letterSpacing: "0.04em",
                      }}>
                        {formatDate(t.date)}
                      </span>

                      {/* Amount */}
                      <div className="flex items-center gap-1 justify-end">
                        <Arrow size={11} style={{ color: isIncome ? "var(--income)" : "var(--expense)" }} />
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: isIncome ? "var(--income)" : "var(--expense)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}>
                          {isIncome ? "+" : "−"}{formatCurrency(t.amount, currency)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditTransaction(t); setShowForm(true); }}
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.borderColor = "var(--border-bright)";
                            el.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.borderColor = "transparent";
                            el.style.color = "var(--text-tertiary)";
                          }}
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={() => setConfirmId(t.id)}
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.borderColor = "var(--expense)";
                            el.style.color = "var(--expense)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.borderColor = "transparent";
                            el.style.color = "var(--text-tertiary)";
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
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