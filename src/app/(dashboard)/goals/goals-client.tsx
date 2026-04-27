"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoalForm, ContributeForm } from "@/components/forms/goal-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Goal } from "@/types";
import {
  Plus, Pencil, Trash2, PlusCircle,
  Trophy, Target, Calendar,
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          {goals.length > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-secondary)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
              {formatCurrency(totalSaved, currency)} saved overall
            </span>
          )}
          {completed > 0 && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[0.55rem] uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Trophy size={10} />
              {completed} Mastered
            </span>
          )}
        </div>
        <button
          className="btn-acid flex items-center gap-2 py-2 px-4 shadow-sm transition-transform hover:scale-105"
          onClick={() => { setEditGoal(null); setShowForm(true); }}
        >
          <Plus size={14} strokeWidth={3} />
          <span className="font-semibold tracking-wide text-xs uppercase">New Goal</span>
        </button>
      </div>

      {/* Empty state */}
      {goals.length === 0 ? (
        <div className="rounded-xl" style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "4rem 2rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
        }}>
          <div className="p-4 rounded-full" style={{ backgroundColor: "var(--surface-2)" }}>
            <Target size={32} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div className="text-center">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
              No savings goals yet
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
              Create your first goal to start tracking progress
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g, i) => {
            const pct = g.target_amount > 0
              ? Math.min((g.current_amount / g.target_amount) * 100, 100)
              : 0;
            const isConfirming = confirmId === g.id;
            const accentColor = g.is_completed ? "var(--income)" : (g.color || "var(--acid)");

            return (
              <div
                key={g.id}
                className={`animate-fade-in group rounded-xl border transition-all duration-300 ${g.is_completed ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.08)] -translate-y-1' : 'border-[var(--border)] hover:-translate-y-1 hover:shadow-xl'}`}
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Completed Celebration Glow */}
                {g.is_completed && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at top right, rgba(16,185,129,0.15) 0%, transparent 60%)",
                    pointerEvents: "none",
                  }} />
                )}

                {/* Top row */}
                <div className="flex items-start justify-between mb-6" style={{ position: "relative", zIndex: 10 }}>
                  <div className="flex items-center gap-3">
                    {g.is_completed ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <Trophy size={18} className="text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Target size={16} style={{ color: g.color || "var(--acid)" }} />
                      </div>
                    )}
                    <div>
                      <div style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: g.is_completed ? "var(--income)" : "var(--text-primary)",
                        letterSpacing: "0.04em",
                      }}>
                        {g.name}
                      </div>
                      {g.is_completed && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--income)", letterSpacing: "0.15em", marginTop: "2px", fontWeight: 700, textTransform: "uppercase" }}>
                          Goal Achieved
                        </div>
                      )}
                      {g.target_date && !g.is_completed && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Calendar size={10} style={{ color: "var(--text-tertiary)" }} />
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Target: {formatDate(g.target_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <button className="text-[0.6rem] uppercase tracking-widest font-mono text-muted-foreground hover:text-white" onClick={() => setConfirmId(null)}>Cancel</button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[0.6rem] font-bold uppercase tracking-widest transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <>
                        {!g.is_completed && (
                          <button
                            onClick={() => setContributeGoal(g)}
                            title="Add contribution"
                            className="w-8 h-8 flex items-center justify-center rounded-md text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-emerald-500/20"
                          >
                            <PlusCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditGoal(g); setShowForm(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-white transition-all ml-1"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmId(g.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-end justify-between mb-4" style={{ position: "relative", zIndex: 10 }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "2rem",
                      lineHeight: 1,
                      color: accentColor,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.02em",
                      textShadow: g.is_completed ? "0 0 20px rgba(16,185,129,0.4)" : "none"
                    }}>
                      {formatCurrency(g.current_amount, currency)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)", letterSpacing: "0.08em", marginTop: "0.5rem" }}>
                      of {formatCurrency(g.target_amount, currency)} target
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2.5rem",
                    lineHeight: 0.8,
                    color: accentColor,
                    opacity: g.is_completed ? 0.3 : 0.1,
                    letterSpacing: "0.02em",
                    userSelect: "none",
                  }}>
                    {pct.toFixed(0)}%
                  </div>
                </div>

                {/* Gamified Progress bar with Milestones */}
                <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner" style={{ zIndex: 10 }}>
                  {/* Milestone Markers */}
                  <div className="absolute top-0 bottom-0 left-[25%] w-px bg-white/10 z-10" />
                  <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/20 z-10" />
                  <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/10 z-10" />
                  
                  {/* Fill */}
                  <div
                    className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: accentColor, boxShadow: g.is_completed ? "0 0 10px rgba(16,185,129,0.8)" : "none" }}
                  />
                </div>

                {/* Sub-label */}
                <div className="flex justify-between mt-2.5" style={{ position: "relative", zIndex: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: g.is_completed ? "var(--income)" : "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {pct >= 25 && pct < 50 && "Good start!"}
                    {pct >= 50 && pct < 75 && "Halfway there!"}
                    {pct >= 75 && pct < 100 && "Almost done!"}
                    {pct === 100 && "Nailed it!"}
                    {pct < 25 && `${pct.toFixed(1)}% funded`}
                  </span>
                  {!g.is_completed && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {formatCurrency(g.target_amount - g.current_amount, currency)} to go
                    </span>
                  )}
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