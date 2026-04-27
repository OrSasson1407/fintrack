"use client";

import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
}

const TYPE_OPTIONS = [
  { value: "all",     label: "All" },
  { value: "income",  label: "Income" },
  { value: "expense", label: "Expense" },
];

export function TransactionFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Search */}
      <div className="relative">
        <Search
          size={11}
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            paddingLeft: "2rem",
            paddingRight: search ? "2rem" : "0.75rem",
            paddingTop: "0.4rem",
            paddingBottom: "0.4rem",
            width: "220px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Type toggle pills */}
      <div
        className="flex"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}
      >
        {TYPE_OPTIONS.map((opt) => {
          const active = typeFilter === opt.value;
          const activeColor =
            opt.value === "income"
              ? "var(--income)"
              : opt.value === "expense"
              ? "var(--expense)"
              : "var(--acid)";
          return (
            <button
              key={opt.value}
              onClick={() => onTypeChange(opt.value)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.4rem 0.85rem",
                backgroundColor: active ? "var(--surface-3)" : "transparent",
                color: active ? activeColor : "var(--text-tertiary)",
                borderRight: "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.12s ease",
                borderBottom: active ? `2px solid ${activeColor}` : "2px solid transparent",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Category select */}
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.04em",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            borderRadius: 0,
            height: "auto",
            padding: "0.4rem 0.75rem",
            width: "180px",
          }}
        >
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 0,
          }}
        >
          <SelectItem value="all" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
            All Categories
          </SelectItem>
          {categories.map((c) => (
            <SelectItem
              key={c.id}
              value={c.id}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
            >
              <span className="flex items-center gap-2">
                <span style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  backgroundColor: c.color || "var(--text-tertiary)",
                  flexShrink: 0,
                }} />
                {c.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}