"use client";

import { Bell, Search, Plus, ChevronRight } from "lucide-react";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TopbarProps {
  fullName: string | null;
  email: string;
}

const PAGE_META: Record<string, { title: string; code: string; description: string }> = {
  "/":             { title: "Overview",     code: "01", description: "Financial summary & recent activity" },
  "/transactions": { title: "Transactions", code: "02", description: "All income & expense records" },
  "/budgets":      { title: "Budgets",      code: "03", description: "Monthly spending limits" },
  "/goals":        { title: "Goals",        code: "04", description: "Savings targets & progress" },
  "/analytics":    { title: "Analytics",    code: "05", description: "Trends, charts & reports" },
  "/settings":     { title: "Settings",     code: "06", description: "Account & preferences" },
};

function getPageMeta(pathname: string) {
  if (pathname === "/") return PAGE_META["/"];
  for (const [key, val] of Object.entries(PAGE_META)) {
    if (key !== "/" && pathname.startsWith(key)) return val;
  }
  return PAGE_META["/"];
}

export function Topbar({ fullName, email }: TopbarProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 transition-all duration-300"
      style={{
        backgroundColor: "rgba(10, 10, 10, 0.8)", // Semi-transparent charcoal
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Left — breadcrumb + page identity */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Fintrack
          </span>
          <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--acid)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: "0 0 10px rgba(181, 204, 24, 0.3)"
          }}>
            {meta.title}
          </span>
        </div>

        <div className="hidden md:block w-px h-6 bg-[var(--border)] mx-2" />

        {/* Title block */}
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
            lineHeight: 1,
            color: "var(--text-primary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {meta.title}
          </h1>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.05em",
            marginTop: "4px",
          }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Live clock */}
        <span
          className="hidden md:block mr-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {time}
        </span>

        {/* Search */}
        <button
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-muted-foreground hover:text-white hover:border-white/20 transition-all group"
        >
          <Search size={13} className="group-hover:text-[var(--acid)] transition-colors" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Search
          </span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[0.5rem] font-mono">
            ⌘K
          </span>
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-muted-foreground hover:text-white hover:border-white/20 transition-all group"
        >
          <Bell size={14} className="group-hover:text-[var(--acid)] transition-colors" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--acid)] shadow-[0_0_8px_var(--acid)]" />
        </button>

        {/* Add transaction (Routes to the new FAB sheet flow) */}
        <Link href="/transactions?add=true" prefetch={true} className="hidden sm:flex">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--acid)] hover:bg-[#b5cc18] text-black font-bold uppercase tracking-wide text-xs rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(181,204,24,0.3)]">
            <Plus size={14} strokeWidth={2.5} />
            <span>Add</span>
          </button>
        </Link>

        {/* User */}
        <div className="pl-2 ml-1 border-l border-[var(--border)]">
          <UserMenu fullName={fullName} email={email} />
        </div>
      </div>
    </header>
  );
}