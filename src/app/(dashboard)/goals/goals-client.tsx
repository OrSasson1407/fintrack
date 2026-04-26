"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalForm, ContributeForm } from "@/components/forms/goal-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Goal } from "@/types";
import { Plus, Pencil, Trash2, PlusCircle, Trophy } from "lucide-react";

interface GoalsClientProps {
  goals: Goal[];
  currency: string;
  userId: string;
}

export function GoalsClient({ goals, currency, userId }: GoalsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal and all its contributions?")) return;
    await supabase.from("goals").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditGoal(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            No savings goals yet. Create your first goal to start saving!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const percentage = g.target_amount > 0
              ? Math.min((g.current_amount / g.target_amount) * 100, 100)
              : 0;
            return (
              <Card key={g.id} className={g.is_completed ? "border-emerald-300 dark:border-emerald-800" : ""}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {g.is_completed ? (
                        <Trophy className="h-5 w-5 text-amber-500" />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: g.color }}
                        >
                          {g.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{g.name}</p>
                        {g.target_date && (
                          <p className="text-xs text-slate-500">Target: {formatDate(g.target_date)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!g.is_completed && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => setContributeGoal(g)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditGoal(g); setShowForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(g.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {formatCurrency(g.current_amount, currency)} of {formatCurrency(g.target_amount, currency)}
                      </span>
                      <span className="font-medium text-indigo-600">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: g.color }}
                      />
                    </div>
                  </div>

                  {g.is_completed && (
                    <p className="text-sm text-emerald-600 font-medium text-center">Goal completed!</p>
                  )}
                </CardContent>
              </Card>
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