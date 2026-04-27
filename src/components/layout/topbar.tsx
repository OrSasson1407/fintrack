"use client";

import { Bell, Search, Plus } from "lucide-react";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";

interface TopbarProps {
  fullName: string | null;
  email: string;
}

const PAGE_META: Record<string, { title: string; code: string; description: string }> = {
  "/":             { title: "Overview",      code: "01", description: "Financial summary & recent activity" },
  "/transactions": { title: "Transactions",  code: "02", description: "All income & expense records" },
  "/budgets":      { title: "Budgets",       code: "03", description: "Monthly spending limits" },
  "/goals":        { title: "Goals",         code: "04", description: "Savings targets & progress" },
  "/analytics":    { title: "Analytics",     code: "05", description: "Trends, charts & reports" },
  "/settings":     { title: "Settings",      code: "06", description: "Account & preferences" },
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
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 h-14"
      style={{
        backgroundColor: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left — Mobile hamburger + Page identity */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger — only visible on small screens */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Code — hidden on mobile */}
        <span className="hidden md:block" style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "var(--text-tertiary)",
          letterSpacing: "0.12em",
          minWidth: "16px",
        }}>
          {meta.code}
        </span>

        {/* Separator */}
        <div style={{ width: 1, height: 20, backgroundColor: "var(--border)" }} />

        {/* Title */}
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            lineHeight: "1",
            color: "var(--text-primary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            {meta.title}
          </h1>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.52rem",
            color: "var(--text-tertiary)",
            letterSpacing: "0.06em",
            marginTop: "1px",
          }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Clock */}
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--text-tertiary)",
          letterSpacing: "0.08em",
          paddingRight: "0.75rem",
          borderRight: "1px solid var(--border)",
        }}>
          {timeStr}
        </span>

        {/* Search button */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-150"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
        >
          <Search size={12} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Search
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.5rem",
            color: "var(--text-tertiary)",
            backgroundColor: "var(--surface-3)",
            padding: "1px 5px",
            border: "1px solid var(--border)",
            marginLeft: "4px",
          }}>
            ⌘K
          </span>
        </button>

        {/* Notification button */}
        <button
          className="relative flex items-center justify-center w-8 h-8 transition-all duration-150"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
        >
          <Bell size={13} />
          {/* Notification dot */}
          <div style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: "var(--acid)",
            border: "1px solid var(--charcoal)",
          }} />
        </button>

        {/* Quick Add CTA */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-150 btn-acid"
        >
          <Plus size={12} />
          <span>Add</span>
        </button>

        {/* User avatar */}
        <div style={{ paddingLeft: "0.5rem", borderLeft: "1px solid var(--border)" }}>
          <UserMenu fullName={fullName} email={email} />
        </div>
      </div>
    </header>
  );
}
