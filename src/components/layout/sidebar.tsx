"use client";

import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  
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
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          marginBottom: "0.75rem",
        }}>
          Personal Finance OS
        </div>

        <button onClick={() => router.push("/")} className="flex items-baseline gap-0 group cursor-pointer text-left">
          <span className="transition-colors duration-300 group-hover:text-white" style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, color: "var(--acid)", letterSpacing: "0.04em" }}>
            FIN
          </span>
          <span className="transition-colors duration-300 group-hover:text-[var(--acid)]" style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
            TRACK
          </span>
        </button>

        <div className="flex items-center gap-2.5 mt-3">
          <span className="px-1.5 py-0.5 rounded text-[0.45rem] font-bold uppercase tracking-widest bg-[var(--acid)] text-black">
            v1.0
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
            {currentDate}
          </span>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-6 pb-3">
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          fontWeight: 600
        }}>
          Navigation
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <button
                  onClick={() => router.push(item.href)}
                  className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-1 cursor-pointer text-left"
                  style={{
                    background: isActive ? "linear-gradient(90deg, rgba(181, 204, 24, 0.1) 0%, transparent 100%)" : "transparent",
                    borderLeft: `2px solid ${isActive ? "var(--acid)" : "transparent"}`,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.48rem",
                    color: isActive ? "var(--acid)" : "var(--text-tertiary)",
                    letterSpacing: "0.1em",
                    minWidth: "12px",
                    opacity: isActive ? 1 : 0.5,
                  }}>
                    {item.code}
                  </span>

                  <item.icon
                    size={14}
                    className="transition-colors duration-200 group-hover:text-[var(--acid)]"
                    style={{ color: isActive ? "var(--acid)" : "var(--text-secondary)", flexShrink: 0 }}
                  />

                  <span className="transition-colors duration-200 group-hover:text-white" style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    flex: 1,
                  }}>
                    {item.label}
                  </span>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_var(--acid)]" style={{ backgroundColor: "var(--acid)", flexShrink: 0 }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status Footer */}
      <div className="px-6 py-5 bg-black/20" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            System Status
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.45rem", color: "var(--income)", letterSpacing: "0.1em", fontWeight: 600 }}>
              ONLINE
            </span>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {[
            { label: "Database", val: "OK", color: "var(--income)" },
            { label: "Sync", val: "OK", color: "var(--income)" },
            { label: "API", val: "OK", color: "var(--income)" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
                {s.label}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: s.color, letterSpacing: "0.1em" }}>
                {s.val}
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-md"
          style={{ backgroundColor: "rgba(181, 204, 24, 0.05)", border: "1px solid rgba(181, 204, 24, 0.15)" }}
        >
          <Activity size={12} style={{ color: "var(--acid)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--acid)", letterSpacing: "0.04em" }}>
            Your data. Your control.
          </span>
        </div>
      </div>
    </aside>
  );
}