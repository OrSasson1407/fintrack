"use client";

import { useState } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, type BudgetFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Category, Budget } from "@/types";
import { useRouter } from "next/navigation";
import { getCurrentMonth, getCurrentYear } from "@/lib/utils";

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  editBudget?: Budget | null;
  userId: string;
}

export function BudgetForm({ open, onClose, categories, editBudget, userId }: BudgetFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Explicitly type useForm and cast the resolver to align Zod's input with Hook Form's output
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as unknown as Resolver<BudgetFormData>,
    defaultValues: editBudget
      ? {
          category_id: editBudget.category_id,
          amount: editBudget.amount,
          month: editBudget.month,
          year: editBudget.year,
        }
      : {
          category_id: "",
          amount: 0,
          month: getCurrentMonth(),
          year: getCurrentYear(),
        },
  });

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const onSubmit: SubmitHandler<BudgetFormData> = async (data) => {
    setLoading(true);
    setError(null);

    if (editBudget) {
      const { error } = await supabase
        .from("budgets")
        .update({ amount: data.amount })
        .eq("id", editBudget.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase
        .from("budgets")
        .insert({ ...data, user_id: userId });
      if (error) {
        if (error.message.includes("duplicate")) {
          setError("Budget for this category/month already exists. Edit it instead.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editBudget ? "Edit Budget" : "Set Budget"}</DialogTitle>
          <DialogDescription>
            {editBudget 
              ? "Update your monthly spending limit for this category." 
              : "Set a monthly spending limit to track your financial goals."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              onValueChange={(v) => setValue("category_id", v)}
              defaultValue={editBudget?.category_id}
              disabled={!!editBudget}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Budget Amount</Label>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              {...register("amount", { valueAsNumber: true })} 
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                onValueChange={(v) => setValue("month", parseInt(v))}
                defaultValue={String(editBudget?.month || getCurrentMonth())}
                disabled={!!editBudget}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(2024, i).toLocaleString("en", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input 
                type="number" 
                {...register("year", { valueAsNumber: true })} 
                disabled={!!editBudget} 
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : editBudget ? "Update" : "Set Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}