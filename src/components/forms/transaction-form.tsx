"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category, Transaction } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  editTransaction?: Transaction | null;
  userId: string;
}

export function TransactionForm({ open, onClose, categories, editTransaction, userId }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editTransaction
      ? {
          type: editTransaction.type,
          amount: editTransaction.amount,
          category_id: editTransaction.category_id,
          description: editTransaction.description || "",
          date: editTransaction.date,
          payment_method: editTransaction.payment_method,
        }
      : {
          type: "expense",
          amount: 0,
          category_id: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          payment_method: "cash",
        },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    setError(null);

    if (editTransaction) {
      const { error } = await supabase
        .from("transactions")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editTransaction.id);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("transactions")
        .insert({ ...data, user_id: userId });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
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
          <DialogTitle>{editTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedType === "expense" ? "default" : "outline"}
              className={selectedType === "expense" ? "bg-rose-600 hover:bg-rose-700" : ""}
              onClick={() => { setValue("type", "expense"); setValue("category_id", ""); }}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={selectedType === "income" ? "default" : "outline"}
              className={selectedType === "income" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              onClick={() => { setValue("type", "income"); setValue("category_id", ""); }}
            >
              Income
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(v) => setValue("category_id", v)} defaultValue={editTransaction?.category_id}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select onValueChange={(v) => setValue("payment_method", v)} defaultValue={editTransaction?.payment_method || "cash"}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input placeholder="E.g. Lunch at cafe" {...register("description")} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : editTransaction ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}