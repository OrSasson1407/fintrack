"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BudgetForm } from "@/components/forms/budget-form";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { Budget, Category } from "@/types";
import { Plus, Pencil, Trash2, AlertTriangle, Inbox } from "lucide-react";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            fontWeight: 600
          }}>
            {getMonthName(month)} {year}
          </span>
          {overCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 font-mono text-[0.55rem] uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle size={10} />
              {overCount} critical
            </span>
          )}
        </div>
        <button
          className="btn-acid flex items-center gap-2 py-2 px-4 shadow-sm transition-transform hover:scale-105"
          onClick={() => { setEditBudget(null); setShowForm(true); }}
        >
          <Plus size={14} strokeWidth={3} />
          <span className="font-semibold tracking-wide text-xs uppercase">Set Budget</span>
        </button>
      </div>

      {/* Summary strip */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--border)", border: "1px solid var(--border)" }}>
          {[
            { label: "Total Budgeted", value: formatCurrency(totalBudgeted, currency), color: "var(--text-primary)" },
            { label: "Total Spent",    value: formatCurrency(totalSpent, currency),    color: totalSpent > totalBudgeted ? "var(--expense)" : "var(--text-primary)" },
            { label: "Remaining",      value: formatCurrency(totalBudgeted - totalSpent, currency), color: totalBudgeted - totalSpent < 0 ? "var(--expense)" : "var(--income)" },
          ].map((s) => (
            <div key={s.label} className="bg-surface transition-colors hover:bg-surface-2 p-5">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: s.color, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {budgets.length === 0 ? (
        <div className="rounded-xl" style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "4rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}>
          <div className="p-4 rounded-full" style={{ backgroundColor: "var(--surface-2)" }}>
            <Inbox size={32} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div className="text-center">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
              No budgets this month
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
              Click "Set Budget" to define spending limits
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b, i) => {
            const ratio     = b.spent / b.amount;
            const pct       = Math.min(ratio * 100, 100);
            const remaining = b.amount - b.spent;
            const status    = getStatus(b.spent, b.amount);
            const isConfirming = confirmId === b.id;
            
            // Gamified gradient states
            const isCritical = ratio >= 0.95;
            const isWarning = ratio >= 0.8 && ratio < 0.95;
            const gradientBackground = ratio >= 1 
              ? "linear-gradient(90deg, #f43f5e, #9f1239)" 
              : isWarning 
              ? "linear-gradient(90deg, #f59e0b, #b45309)" 
              : "linear-gradient(90deg, #10b981, #047857)";

            return (
              <div
                key={b.id}
                className={`animate-fade-in group rounded-xl border transition-all duration-300 ${isCritical ? 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 'border-[var(--border)] hover:-translate-y-1 hover:shadow-xl'}`}
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "1.5rem",
                  animationDelay: `${i * 60}ms`,
                  position: "relative",
                }}
              >
                {/* Top row: category + status + actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: b.category?.color || "var(--text-tertiary)",
                      flexShrink: 0,
                      boxShadow: `0 0 10px ${b.category?.color || "var(--text-tertiary)"}40`
                    }} />
                    <div>
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}>
                        {b.category?.name || "Unknown"}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: status.color,
                        marginTop: "4px",
                      }} className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'animate-pulse' : ''}`} style={{ backgroundColor: status.color }}></span>
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!isConfirming && (
                      <>
                        <button
                          onClick={() => { setEditBudget(b); setShowForm(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmId(b.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                    {isConfirming && (
                      <div className="flex items-center gap-2">
                        <button className="text-[0.6rem] uppercase tracking-widest font-mono text-muted-foreground hover:text-white" onClick={() => setConfirmId(null)}>Cancel</button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[0.6rem] font-bold uppercase tracking-widest transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: status.color, fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", lineHeight: 1 }}>
                      {formatCurrency(b.spent, currency)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)", letterSpacing: "0.08em", marginTop: "0.5rem" }}>
                      of {formatCurrency(b.amount, currency)} limit
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: remaining < 0 ? "var(--expense)" : "var(--income)",
                      fontVariantNumeric: "tabular-nums",
                      backgroundColor: remaining < 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.3rem",
                      marginBottom: "0.25rem"
                    }}>
                      {remaining < 0
                        ? `−${formatCurrency(Math.abs(remaining), currency)}`
                        : `+${formatCurrency(remaining, currency)}`}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {remaining < 0 ? "over limit" : "remaining"}
                    </div>
                  </div>
                </div>

                {/* Gamified Progress bar */}
                <div style={{ position: "relative" }}>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isCritical ? 'animate-pulse' : ''}`}
                      style={{
                        width: `${pct}%`,
                        background: gradientBackground,
                        boxShadow: isCritical ? "0 0 12px rgba(244,63,94,0.8)" : "none"
                      }}
                    />
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5rem",
                    color: status.color,
                    letterSpacing: "0.08em",
                    textAlign: "right",
                    marginTop: "0.4rem",
                    fontWeight: isCritical ? 700 : 400
                  }}>
                    {(ratio * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Over-budget alert */}
                {b.spent >= b.amount && (
                  <div
                    className="flex items-center gap-2 mt-3 px-3 py-2 rounded-md animate-fade-in"
                    style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)" }}
                  >
                    <AlertTriangle size={12} className="text-rose-500 animate-pulse flex-shrink-0" />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--expense)", letterSpacing: "0.04em", fontWeight: 600 }}>
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