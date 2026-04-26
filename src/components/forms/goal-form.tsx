"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, contributionSchema, type GoalFormData, type ContributionFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Goal } from "@/types";
import { useRouter } from "next/navigation";

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
  userId: string;
}

export function GoalForm({ open, onClose, editGoal, userId }: GoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: editGoal
      ? {
          name: editGoal.name,
          target_amount: editGoal.target_amount,
          target_date: editGoal.target_date || "",
          icon: editGoal.icon,
          color: editGoal.color,
        }
      : {
          name: "",
          target_amount: 0,
          target_date: "",
          icon: "target",
          color: "#10b981",
        },
  });

  const onSubmit = async (data: GoalFormData) => {
    setLoading(true);
    setError(null);

    const payload = {
      ...data,
      target_date: data.target_date || null,
    };

    if (editGoal) {
      const { error } = await supabase
        .from("goals")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editGoal.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase
        .from("goals")
        .insert({ ...payload, user_id: userId });
      if (error) { setError(error.message); setLoading(false); return; }
    }

    setLoading(false);
    reset();
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editGoal ? "Edit Goal" : "New Savings Goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div className="space-y-2">
            <Label>Goal Name</Label>
            <Input placeholder="E.g. Vacation fund" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Target Amount</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("target_amount")} />
            {errors.target_amount && <p className="text-xs text-red-500">{errors.target_amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Target Date (optional)</Label>
            <Input type="date" {...register("target_date")} />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <Input type="color" {...register("color")} className="h-10 w-20 p-1 cursor-pointer" />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : editGoal ? "Update" : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ContributeFormProps {
  open: boolean;
  onClose: () => void;
  goal: Goal;
  userId: string;
}

export function ContributeForm({ open, onClose, goal, userId }: ContributeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: 0, note: "", date: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: ContributionFormData) => {
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("goal_contributions")
      .insert({
        goal_id: goal.id,
        user_id: userId,
        amount: data.amount,
        note: data.note || null,
        date: data.date || new Date().toISOString().split("T")[0],
      });

    if (insertError) { setError(insertError.message); setLoading(false); return; }

    const newAmount = goal.current_amount + Number(data.amount);
    await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        is_completed: newAmount >= goal.target_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id);

    setLoading(false);
    reset();
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contribution to &quot;{goal.name}&quot;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input placeholder="E.g. Monthly saving" {...register("note")} />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Add Contribution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}