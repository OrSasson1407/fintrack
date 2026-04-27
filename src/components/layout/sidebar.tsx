"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  Activity,
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
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.48rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          marginBottom: "0.6rem",
        }}>
          Personal Finance OS
        </div>

        <Link href="/" className="flex items-baseline gap-0">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, color: "var(--acid)", letterSpacing: "0.04em" }}>
            FIN
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
            TRACK
          </span>
        </Link>

        <div className="flex items-center gap-2 mt-2.5">
          <span className="tag tag-acid" style={{ fontSize: "0.46rem", padding: "1px 5px" }}>v1.0</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)" }}>
            {currentDate}
          </span>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.48rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}>
          Navigation
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-px">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2.5 transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? "var(--acid-muted)" : "transparent",
                    borderLeft: `2px solid ${isActive ? "var(--acid)" : "transparent"}`,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.46rem",
                    color: isActive ? "var(--acid)" : "var(--text-tertiary)",
                    letterSpacing: "0.1em",
                    minWidth: "12px",
                  }}>
                    {item.code}
                  </span>

                  <item.icon
                    size={13}
                    style={{ color: isActive ? "var(--acid)" : "var(--text-secondary)", flexShrink: 0 }}
                  />

                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.66rem",
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--acid)" : "var(--text-secondary)",
                    flex: 1,
                  }}>
                    {item.label}
                  </span>

                  {isActive && (
                    <div style={{ width: 4, height: 4, backgroundColor: "var(--acid)", flexShrink: 0 }} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.48rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>
            System Status
          </span>
          <div className="flex items-center gap-1">
            <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--income)" }} className="animate-pulse-acid" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--income)", letterSpacing: "0.1em" }}>
              ONLINE
            </span>
          </div>
        </div>

        {[
          { label: "Database", val: "OK", color: "var(--income)" },
          { label: "Sync", val: "OK", color: "var(--income)" },
          { label: "API", val: "OK", color: "var(--income)" },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between py-0.5">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)" }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: s.color, letterSpacing: "0.1em" }}>
              {s.val}
            </span>
          </div>
        ))}

        <div
          className="flex items-center gap-2 mt-3 px-3 py-2"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <Activity size={10} style={{ color: "var(--acid)", flexShrink: 0 }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.5rem",
            color: "var(--acid)",
            letterSpacing: "0.04em",
          }}>
            Your data. Your control.
          </span>
        </div>
      </div>
    </aside>
  );
}