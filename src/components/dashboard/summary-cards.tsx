"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
  previousIncome?: number;
  previousExpenses?: number;
}

export function SummaryCards({ 
  totalIncome, 
  totalExpenses, 
  currency,
  previousIncome = 0,
  previousExpenses = 0
}: SummaryCardsProps) {
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0";
  const isPositive = balance >= 0;

  // Helper to calculate percentage change
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeTrend = getTrend(totalIncome, previousIncome);
  const expenseTrend = getTrend(totalExpenses, previousExpenses);

  const cards = [
    {
      code: "01",
      label: "Total Income",
      value: formatCurrency(totalIncome, currency),
      icon: TrendingUp,
      trend: incomeTrend,
      trendGood: incomeTrend >= 0, // More income is good
      color: "var(--income)",
      bg: "var(--income-bg)",
      border: "var(--income)",
    },
    {
      code: "02",
      label: "Total Expenses",
      value: formatCurrency(totalExpenses, currency),
      icon: TrendingDown,
      trend: expenseTrend,
      trendGood: expenseTrend <= 0, // Less expense is good
      color: "var(--expense)",
      bg: "var(--expense-bg)",
      border: "var(--expense)",
    },
    {
      code: "03",
      label: "Net Balance",
      value: formatCurrency(balance, currency),
      icon: Wallet,
      isBalance: true,
      trend: 0,          // <-- Added to satisfy TypeScript
      trendGood: true,   // <-- Added to satisfy TypeScript
      color: isPositive ? "var(--acid)" : "var(--expense)",
      bg: isPositive ? "var(--acid-muted)" : "var(--expense-bg)",
      border: isPositive ? "var(--acid)" : "var(--expense)",
      meta: `${savingsRate}% saved`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        
        return (
          <div
            key={card.code}
            className="group animate-fade-in transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl rounded-xl"
            style={{
              backgroundColor: "var(--surface)",
              border: `1px solid var(--border)`,
              padding: "1.5rem",
              animationDelay: `${i * 80}ms`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Glow on Hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at top right, ${card.color}, transparent 60%)` }}
            />

            {/* Top row */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}>
                  [{card.code}] {card.label}
                </span>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: card.bg,
                  border: `1px solid ${card.border}`,
                }}
              >
                <Icon size={16} style={{ color: card.color }} />
              </div>
            </div>

            {/* Value */}
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              lineHeight: 1,
              color: "var(--text-primary)",
              letterSpacing: "0.02em",
              marginBottom: "1rem",
              fontVariantNumeric: "tabular-nums",
            }} className="relative z-10">
              {card.value}
            </div>

            {/* Footer / Trend Pill */}
            <div className="flex items-center gap-2 relative z-10">
              {card.isBalance ? (
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                  style={{ backgroundColor: card.bg, borderColor: card.border }}
                >
                  {isPositive ? <ArrowUpRight size={12} style={{ color: card.color }} /> : <ArrowDownRight size={12} style={{ color: card.color }} />}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600, color: card.color }}>
                    {card.meta}
                  </span>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: card.trendGood ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    border: `1px solid ${card.trendGood ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
                  }}
                >
                  {card.trend === 0 ? (
                    <Minus size={12} className="text-muted-foreground" />
                  ) : card.trend > 0 ? (
                    <ArrowUpRight size={12} className={card.trendGood ? 'text-emerald-500' : 'text-rose-500'} />
                  ) : (
                    <ArrowDownRight size={12} className={card.trendGood ? 'text-emerald-500' : 'text-rose-500'} />
                  )}
                  <span style={{ 
                    fontFamily: "var(--font-mono)", 
                    fontSize: "0.6rem", 
                    fontWeight: 600,
                    color: card.trendGood ? '#10b981' : '#f43f5e'
                  }}>
                    {Math.abs(card.trend as number).toFixed(1)}%
                  </span>
                </div>
              )}
              {!card.isBalance && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
                  vs last month
                </span>
              )}
            </div>

            {/* Decorative bottom line */}
            <div 
              className="absolute bottom-0 left-0 h-1 transition-all duration-300 group-hover:w-full"
              style={{ width: "30%", backgroundColor: card.color }} 
            />
          </div>
        );
      })}
    </div>
  );
}