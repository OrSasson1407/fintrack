"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard, code: "01" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, code: "02" },
  { href: "/budgets", label: "Budgets", icon: PiggyBank, code: "03" },
  { href: "/goals", label: "Goals", icon: Target, code: "04" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, code: "05" },
  { href: "/settings", label: "Settings", icon: Settings, code: "06" },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <aside
      className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 w-[220px]"
      style={{ backgroundColor: "var(--charcoal)", borderRight: "1px solid var(--border)", zIndex: 50 }}
    >
      {/* Logo Block */}
      <div className="px-6 pt-7 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          display: "block",
          marginBottom: "0.5rem",
        }}>
          Personal Finance
        </span>

        <Link href="/" className="group flex items-baseline gap-0.5">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", lineHeight: "1", color: "var(--acid)", letterSpacing: "0.04em" }}>
            FIN
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", lineHeight: "1", color: "var(--text-primary)", letterSpacing: "0.04em" }}>
            TRACK
          </span>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <span className="tag tag-acid" style={{ fontSize: "0.5rem", padding: "1px 6px" }}>v1.0</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-tertiary)" }}>
            {currentDate}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="mb-3 px-2">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.52rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>
            Navigation
          </span>
        </div>

        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? "var(--acid-muted)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--acid)" : "2px solid transparent",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.48rem",
                    color: isActive ? "var(--acid)" : "var(--text-tertiary)",
                    letterSpacing: "0.1em",
                    minWidth: "14px",
                  }}>
                    {item.code}
                  </span>

                  <item.icon size={13} style={{ color: isActive ? "var(--acid)" : "var(--text-secondary)", flexShrink: 0 }} />

                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    fontWeight: isActive ? "500" : "400",
                    letterSpacing: "0.04em",
                    color: isActive ? "var(--acid)" : "var(--text-secondary)",
                    textTransform: "uppercase",
                  }}>
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="ml-auto" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--acid)" }}>
                      ›
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Status */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
              System
            </span>
            <div className="flex items-center gap-1">
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--income)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "var(--income)", letterSpacing: "0.08em" }}>LIVE</span>
            </div>
          </div>

          {[{ label: "Database", status: "OK" }, { label: "Sync", status: "OK" }].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-0.5">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-tertiary)" }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "var(--income)", letterSpacing: "0.08em" }}>{s.status}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-2" style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <TrendingUp size={11} style={{ color: "var(--acid)", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Privacy-First</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "var(--acid)" }}>Your data. Your control.</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
