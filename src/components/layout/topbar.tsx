"use client";

import { Bell, Search, Plus, ChevronRight } from "lucide-react";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  const btnStyle = {
    backgroundColor: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    transition: "all 0.15s ease",
    cursor: "pointer",
  } as React.CSSProperties;

  const btnHover = (e: React.MouseEvent<HTMLElement>, enter: boolean) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = enter ? "var(--border-bright)" : "var(--border)";
    el.style.color = enter ? "var(--text-primary)" : "var(--text-secondary)";
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 h-14"
      style={{
        backgroundColor: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left — breadcrumb + page identity */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Breadcrumb: FINTRACK / PAGE */}
        <div className="hidden md:flex items-center gap-2">
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Fintrack
          </span>
          <ChevronRight size={10} style={{ color: "var(--text-tertiary)" }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            color: "var(--acid)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            {meta.title}
          </span>
        </div>

        <div style={{ width: 1, height: 20, backgroundColor: "var(--border)" }} className="hidden md:block" />

        {/* Title block */}
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            lineHeight: 1,
            color: "var(--text-primary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {meta.title}
          </h1>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.5rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.05em",
            marginTop: "2px",
          }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Live clock */}
        <span
          className="hidden md:block"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            paddingRight: "0.75rem",
            borderRight: "1px solid var(--border)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {time}
        </span>

        {/* Search */}
        <button
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5"
          style={btnStyle}
          onMouseEnter={(e) => btnHover(e, true)}
          onMouseLeave={(e) => btnHover(e, false)}
        >
          <Search size={11} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Search
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.48rem",
            color: "var(--text-tertiary)",
            backgroundColor: "var(--surface-3)",
            padding: "1px 5px",
            border: "1px solid var(--border)",
            marginLeft: "4px",
          }}>
            ⌘K
          </span>
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-8 h-8"
          style={btnStyle}
          onMouseEnter={(e) => btnHover(e, true)}
          onMouseLeave={(e) => btnHover(e, false)}
        >
          <Bell size={13} />
          <div style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: "var(--acid)",
            border: "1.5px solid var(--charcoal)",
          }} />
        </button>

        {/* Add transaction */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 btn-acid">
          <Plus size={12} />
          <span>Add</span>
        </button>

        {/* User */}
        <div style={{ paddingLeft: "0.5rem", borderLeft: "1px solid var(--border)" }}>
          <UserMenu fullName={fullName} email={email} />
        </div>
      </div>
    </header>
  );
}