"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { ArrowUpRight, ArrowDownRight, Inbox, Clock } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div className="p-4 rounded-full" style={{ backgroundColor: "var(--surface-2)" }}>
          <Inbox size={32} style={{ color: "var(--text-tertiary)" }} />
        </div>
        <div className="text-center">
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            No recent activity
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
            Your latest transactions will appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
            <Clock size={14} className="text-muted-foreground" />
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "0.04em", color: "var(--text-primary)" }}>
              Recent Transactions
            </span>
            <span className="block mt-0.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
              Latest {transactions.length} entries
            </span>
          </div>
        </div>
        <button className="text-xs font-mono font-medium text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
          View All
        </button>
      </div>

      {/* Rows */}
      <ul className="flex flex-col">
        {transactions.map((t, i) => {
          const isIncome = t.type === "income";
          const categoryColor = t.category?.color || "var(--text-tertiary)";
          const categoryName = t.category?.name || "Uncategorized";
          const description = t.description || categoryName;
          
          return (
            <li
              key={t.id}
              className="animate-fade-in group"
              style={{
                borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
                animationDelay: `${i * 30}ms`,
              }}
            >
              <div
                className="grid items-center px-6 py-4 transition-all duration-200 hover:bg-white/5"
                style={{ gridTemplateColumns: "1fr auto auto", gap: "1.5rem" }}
              >
                {/* Visual Icon & Description */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Vibrant Category Monogram Badge */}
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                    style={{ 
                      backgroundColor: `${categoryColor}15`, 
                      border: `1px solid ${categoryColor}30`,
                      color: categoryColor
                    }}
                  >
                    <span className="font-display font-bold text-lg leading-none uppercase">
                      {categoryName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="font-medium text-[0.9rem] text-white truncate mb-0.5">
                      {description}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-tertiary)" }}>
                      {categoryName}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <span className="hidden sm:block" style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--text-tertiary)",
                  whiteSpace: "nowrap",
                }}>
                  {formatDate(t.date)}
                </span>

                {/* Amount */}
                <div className="flex items-center gap-2 justify-end">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)' }}
                  >
                    {isIncome ? (
                      <ArrowUpRight size={12} className="text-emerald-500" />
                    ) : (
                      <ArrowDownRight size={12} className="text-rose-500" />
                    )}
                  </div>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: isIncome ? "var(--income)" : "var(--text-primary)",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}>
                    {isIncome ? "+" : "-"}{formatCurrency(t.amount, currency)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}