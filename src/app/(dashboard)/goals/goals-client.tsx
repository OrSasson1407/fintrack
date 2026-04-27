"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoalForm, ContributeForm } from "@/components/forms/goal-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Goal } from "@/types";
import {
  Plus, Pencil, Trash2, PlusCircle,
  Trophy, Target, Calendar, Inbox, AlertTriangle,
} from "lucide-react";

interface GoalsClientProps {
  goals: Goal[];
  currency: string;
  userId: string;
}

export function GoalsClient({ goals, currency, userId }: GoalsClientProps) {
  const [showForm, setShowForm]           = useState(false);
  const [editGoal, setEditGoal]           = useState<Goal | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [confirmId, setConfirmId]         = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    setConfirmId(null);
    router.refresh();
  };

  const completed = goals.filter(g => g.is_completed).length;
  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {completed > 0 && (
            <span className="tag tag-income">
              <Trophy size={9} style={{ marginRight: 4 }} />
              {completed} completed
            </span>
          )}
          {goals.length > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              {formatCurrency(totalSaved, currency)} saved across {goals.length} goals
            </span>
          )}
        </div>
        <button
          className="btn-acid flex items-center gap-1.5"
          onClick={() => { setEditGoal(null); setShowForm(true); }}
        >
          <Plus size={12} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Empty state */}
      {goals.length === 0 ? (
        <div style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "3.5rem 2rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
        }}>
          <Target size={28} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            No savings goals yet
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
            Create your first goal to start tracking progress
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: "var(--border)" }}>
          {goals.map((g, i) => {
            const pct = g.target_amount > 0
              ? Math.min((g.current_amount / g.target_amount) * 100, 100)
              : 0;
            const isConfirming = confirmId === g.id;
            const accentColor = g.is_completed ? "var(--income)" : (g.color || "var(--acid)");

            return (
              <div
                key={g.id}
                className="animate-fade-in"
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  animationDelay: `${i * 60}ms`,
                  borderBottom: g.is_completed ? `2px solid ${accentColor}` : "none",
                }}
              >
                {/* Completed background glow */}
                {g.is_completed && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, var(--income-bg) 0%, transparent 60%)",
                    pointerEvents: "none",
                  }} />
                )}

                {/* Top row */}
                <div className="flex items-start justify-between mb-4" style={{ position: "relative" }}>
                  <div className="flex items-center gap-3">
                    {g.is_completed ? (
                      <Trophy size={18} style={{ color: "var(--income)", flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 10, height: 10,
                        backgroundColor: g.color || "var(--acid)",
                        flexShrink: 0, marginTop: "3px",
                      }} />
                    )}
                    <div>
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: g.is_completed ? "var(--income)" : "var(--text-primary)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>
                        {g.name}
                      </div>
                      {g.is_completed && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--income)", letterSpacing: "0.1em", marginTop: "2px" }}>
                          ● GOAL ACHIEVED
                        </div>
                      )}
                      {g.target_date && !g.is_completed && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={9} style={{ color: "var(--text-tertiary)" }} />
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
                            Target: {formatDate(g.target_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {isConfirming ? (
                      <>
                        <button className="btn-ghost" style={{ padding: "0.2rem 0.6rem", fontSize: "0.52rem" }} onClick={() => setConfirmId(null)}>Cancel</button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.52rem", fontWeight: 600,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            padding: "0.2rem 0.6rem",
                            backgroundColor: "var(--expense)", color: "var(--text-primary)",
                            border: "1px solid var(--expense)", cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        {!g.is_completed && (
                          <button
                            onClick={() => setContributeGoal(g)}
                            title="Add contribution"
                            style={{
                              width: 26, height: 26,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              backgroundColor: "transparent",
                              border: "1px solid transparent",
                              color: "var(--income)",
                              cursor: "pointer",
                              transition: "all 0.12s ease",
                            }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--income)"; el.style.backgroundColor = "var(--income-bg)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "transparent"; el.style.backgroundColor = "transparent"; }}
                          >
                            <PlusCircle size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditGoal(g); setShowForm(true); }}
                          style={{
                            width: 26, height: 26,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border-bright)"; el.style.color = "var(--text-primary)"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "transparent"; el.style.color = "var(--text-tertiary)"; }}
                        >
                          <Pencil size={10} />
                        </button>
                        <button
                          onClick={() => setConfirmId(g.id)}
                          style={{
                            width: 26, height: 26,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: "transparent",
                            border: "1px solid transparent",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--expense)"; el.style.color = "var(--expense)"; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "transparent"; el.style.color = "var(--text-tertiary)"; }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-baseline justify-between mb-3" style={{ position: "relative" }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5rem",
                      color: accentColor,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.02em",
                    }}>
                      {formatCurrency(g.current_amount, currency)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                      of {formatCurrency(g.target_amount, currency)} target
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    color: accentColor,
                    opacity: 0.15,
                    letterSpacing: "0.02em",
                    userSelect: "none",
                  }}>
                    {pct.toFixed(0)}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-track" style={{ position: "relative" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, backgroundColor: accentColor }}
                  />
                </div>

                {/* Sub-label */}
                <div className="flex justify-between mt-1.5" style={{ position: "relative" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                    {pct.toFixed(1)}% funded
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                    {formatCurrency(g.target_amount - g.current_amount, currency)} to go
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GoalForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditGoal(null); }}
        editGoal={editGoal}
        userId={userId}
      />

      {contributeGoal && (
        <ContributeForm
          open={!!contributeGoal}
          onClose={() => setContributeGoal(null)}
          goal={contributeGoal}
          userId={userId}
        />
      )}
    </div>
  );
}