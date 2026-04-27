"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { ArrowUpRight, ArrowDownRight, Inbox } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "3rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Inbox size={28} style={{ color: "var(--text-tertiary)" }} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-tertiary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          No transactions yet
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
          Add your first transaction to get started
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.48rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>
            02 /
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
            textTransform: "uppercase",
          }}>
            Recent Transactions
          </span>
        </div>
        <span className="tag tag-muted">
          {transactions.length} entries
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid px-5 py-2"
        style={{
          gridTemplateColumns: "1fr auto auto",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface-2)",
        }}
      >
        {["Description", "Date", "Amount"].map((h) => (
          <span key={h} style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.48rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            textAlign: h === "Amount" ? "right" : "left",
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <ul>
        {transactions.map((t, i) => {
          const isIncome = t.type === "income";
          const Arrow = isIncome ? ArrowUpRight : ArrowDownRight;
          return (
            <li
              key={t.id}
              className="animate-fade-in"
              style={{
                borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div
                className="grid items-center px-5 py-3 transition-colors duration-100"
                style={{
                  gridTemplateColumns: "1fr auto auto",
                  gap: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
              >
                {/* Description */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category dot */}
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
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                }}>
                  {formatDate(t.date)}
                </span>

                {/* Amount */}
                <div className="flex items-center gap-1.5 justify-end">
                  <Arrow size={11} style={{ color: isIncome ? "var(--income)" : "var(--expense)", flexShrink: 0 }} />
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: isIncome ? "var(--income)" : "var(--expense)",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}>
                    {isIncome ? "+" : "−"}{formatCurrency(t.amount, currency)}
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