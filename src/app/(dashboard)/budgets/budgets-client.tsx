"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BudgetForm } from "@/components/forms/budget-form";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Budget, Category } from "@/types";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, Inbox } from "lucide-react";

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
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id);
    setConfirmId(null);
    router.refresh();
  };

  const getStatus = (spent: number, amount: number) => {
    const ratio = spent / amount;
    if (ratio >= 1)   return { label: "OVER",  color: "var(--expense)",  bg: "var(--expense-bg)" };
    if (ratio >= 0.8) return { label: "WARN",  color: "var(--warning)",  bg: "var(--warning-bg)" };
    return              { label: "OK",    color: "var(--income)",   bg: "var(--income-bg)" };
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount     = budgets.filter(b => b.spent >= b.amount).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>
            {getMonthName(month)} {year}
          </span>
          {overCount > 0 && (
            <span className="tag tag-expense">
              {overCount} over budget
            </span>
          )}
        </div>
        <button
          className="btn-acid flex items-center gap-1.5"
          onClick={() => { setEditBudget(null); setShowForm(true); }}
        >
          <Plus size={12} />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Summary strip */}
      {budgets.length > 0 && (
        <div
          className="grid grid-cols-3 gap-px"
          style={{ backgroundColor: "var(--border)", border: "1px solid var(--border)" }}
        >
          {[
            { label: "Total Budgeted", value: formatCurrency(totalBudgeted, currency), color: "var(--text-primary)" },
            { label: "Total Spent",    value: formatCurrency(totalSpent, currency),    color: totalSpent > totalBudgeted ? "var(--expense)" : "var(--text-primary)" },
            { label: "Remaining",      value: formatCurrency(totalBudgeted - totalSpent, currency), color: totalBudgeted - totalSpent < 0 ? "var(--expense)" : "var(--income)" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "var(--surface-2)", padding: "0.75rem 1.25rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "0.25rem" }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: s.color, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {budgets.length === 0 ? (
        <div style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "3.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <Inbox size={28} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            No budgets this month
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
            Click "Set Budget" to define spending limits
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: "var(--border)" }}>
          {budgets.map((b, i) => {
            const pct       = Math.min((b.spent / b.amount) * 100, 100);
            const remaining = b.amount - b.spent;
            const status    = getStatus(b.spent, b.amount);
            const isConfirming = confirmId === b.id;

            return (
              <div
                key={b.id}
                className="animate-fade-in"
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "1.25rem 1.5rem",
                  animationDelay: `${i * 60}ms`,
                  position: "relative",
                }}
              >
                {/* Top row: category + status + actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div style={{
                      width: 8,
                      height: 8,
                      backgroundColor: b.category?.color || "var(--text-tertiary)",
                      flexShrink: 0,
                      marginTop: "2px",
                    }} />
                    <div>
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}>
                        {b.category?.name || "Unknown"}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.48rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: status.color,
                        marginTop: "2px",
                      }}>
                        ● {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isConfirming && (
                      <>
                        <button
                          onClick={() => { setEditBudget(b); setShowForm(true); }}
                          style={{
                            width: 26, height: 26,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border-bright)"; el.style.color = "var(--text-primary)"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "transparent"; el.style.color = "var(--text-tertiary)"; }}
                        >
                          <Pencil size={10} />
                        </button>
                        <button
                          onClick={() => setConfirmId(b.id)}
                          style={{
                            width: 26, height: 26,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--expense)"; el.style.color = "var(--expense)"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "transparent"; el.style.color = "var(--text-tertiary)"; }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </>
                    )}
                    {isConfirming && (
                      <div className="flex items-center gap-1.5">
                        <button className="btn-ghost" style={{ padding: "0.2rem 0.6rem", fontSize: "0.52rem" }} onClick={() => setConfirmId(null)}>Cancel</button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.52rem", fontWeight: 600,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            padding: "0.2rem 0.6rem",
                            backgroundColor: "var(--expense)", color: "var(--text-primary)",
                            border: "1px solid var(--expense)", cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-baseline justify-between mb-2.5">
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: status.color, fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
                      {formatCurrency(b.spent, currency)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                      of {formatCurrency(b.amount, currency)} limit
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: remaining < 0 ? "var(--expense)" : "var(--income)",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {remaining < 0
                        ? `−${formatCurrency(Math.abs(remaining), currency)}`
                        : `+${formatCurrency(remaining, currency)}`}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>
                      {remaining < 0 ? "over limit" : "remaining"}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ position: "relative" }}>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: status.color,
                      }}
                    />
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.46rem",
                    color: status.color,
                    letterSpacing: "0.08em",
                    textAlign: "right",
                    marginTop: "0.3rem",
                  }}>
                    {pct.toFixed(0)}%
                  </div>
                </div>

                {/* Over-budget alert */}
                {b.spent >= b.amount && (
                  <div
                    className="flex items-center gap-1.5 mt-2 px-2 py-1.5"
                    style={{ backgroundColor: "var(--expense-bg)", border: "1px solid var(--expense)" }}
                  >
                    <AlertTriangle size={10} style={{ color: "var(--expense)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--expense)", letterSpacing: "0.04em" }}>
                      Budget exceeded by {formatCurrency(Math.abs(remaining), currency)}
                    </span>
                  </div>
                )}
              </div>
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