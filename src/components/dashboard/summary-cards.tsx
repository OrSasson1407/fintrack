"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
}

export function SummaryCards({ totalIncome, totalExpenses, currency }: SummaryCardsProps) {
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0";
  const isPositive = balance >= 0;

  const cards = [
    {
      code: "01",
      label: "Total Income",
      value: formatCurrency(totalIncome, currency),
      icon: TrendingUp,
      arrow: ArrowUpRight,
      color: "var(--income)",
      bg: "var(--income-bg)",
      border: "var(--income)",
      meta: "This month",
    },
    {
      code: "02",
      label: "Total Expenses",
      value: formatCurrency(totalExpenses, currency),
      icon: TrendingDown,
      arrow: ArrowDownRight,
      color: "var(--expense)",
      bg: "var(--expense-bg)",
      border: "var(--expense)",
      meta: "This month",
    },
    {
      code: "03",
      label: "Net Balance",
      value: formatCurrency(balance, currency),
      icon: Wallet,
      arrow: isPositive ? ArrowUpRight : ArrowDownRight,
      color: isPositive ? "var(--acid)" : "var(--expense)",
      bg: isPositive ? "var(--acid-muted)" : "var(--expense-bg)",
      border: isPositive ? "var(--acid)" : "var(--expense)",
      meta: `${savingsRate}% savings rate`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ backgroundColor: "var(--border)" }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        const Arrow = card.arrow;
        return (
          <div
            key={card.code}
            className="animate-fade-in hover-lift"
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.5rem",
              animationDelay: `${i * 80}ms`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.48rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}>
                  [{card.code}] {card.label}
                </span>
              </div>
              <div style={{
                width: 32,
                height: 32,
                backgroundColor: card.bg,
                border: `1px solid ${card.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={14} style={{ color: card.color }} />
              </div>
            </div>

            {/* Value */}
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              lineHeight: 1,
              color: card.color,
              letterSpacing: "0.02em",
              marginBottom: "0.75rem",
              fontVariantNumeric: "tabular-nums",
            }}>
              {card.value}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5">
              <Arrow size={11} style={{ color: card.color }} />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
              }}>
                {card.meta}
              </span>
            </div>

            {/* Decorative corner line */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "2px",
              backgroundColor: card.border,
              opacity: 0.4,
            }} />
          </div>
        );
      })}
    </div>
  );
}