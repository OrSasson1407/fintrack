"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 hover:bg-white/5 relative z-50 cursor-pointer"
        style={{
          backgroundColor: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Open navigation"
      >
        <Menu size={16} className="pointer-events-none" />
      </button>

      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-[100] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: "var(--charcoal)", borderRight: "1px solid var(--border)" }}
      >
        {/* Close Button */}
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Logo Block */}
        <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: "0.5rem",
          }}>
            Personal Finance
          </span>
          <div className="flex items-baseline gap-0.5">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: "1", color: "var(--acid)", letterSpacing: "0.04em" }}>FIN</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: "1", color: "var(--text-primary)", letterSpacing: "0.04em" }}>TRACK</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-1.5 py-0.5 rounded text-[0.45rem] font-bold uppercase tracking-widest bg-[var(--acid)] text-black">v1.0</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-4 px-2">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 600 }}>
              Navigation
            </span>
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigate(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 cursor-pointer"
                    style={{
                      background: isActive ? "linear-gradient(90deg, rgba(181, 204, 24, 0.1) 0%, transparent 100%)" : "transparent",
                      borderLeft: isActive ? "2px solid var(--acid)" : "2px solid transparent",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: isActive ? "var(--acid)" : "var(--text-tertiary)", letterSpacing: "0.1em", minWidth: "14px", opacity: isActive ? 1 : 0.5 }}>
                      {item.code}
                    </span>
                    <item.icon size={15} style={{ color: isActive ? "var(--acid)" : "var(--text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: isActive ? "600" : "500", letterSpacing: "0.05em", color: isActive ? "var(--text-primary)" : "var(--text-secondary)", textTransform: "uppercase" }}>
                      {item.label}
                    </span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--acid)] shadow-[0_0_8px_var(--acid)]" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-5 bg-black/20" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <Activity size={12} className="text-[var(--acid)] animate-pulse" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Privacy-First</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--acid)" }}>Your data. Your control.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}