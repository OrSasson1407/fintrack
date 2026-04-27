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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
    resolver: zodResolver(transactionSchema) as any, // <-- Added "as any"
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
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md border-l border-border bg-surface flex flex-col h-full p-0">
        <SheetHeader className="px-6 py-6 border-b border-border bg-surface-2">
          <SheetTitle className="text-xl font-display tracking-wide">
            {editTransaction ? "Edit Transaction" : "New Transaction"}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {editTransaction ? "Update your records" : "Log a new entry instantly"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-950/40 border border-red-900 text-red-400 text-sm p-4 rounded-md font-mono">
                {error}
              </div>
            )}

            {/* Type Segmented Control */}
            <div className="p-1 bg-black/40 rounded-lg flex gap-1 border border-white/5">
              <Button
                type="button"
                variant="ghost"
                className={`flex-1 rounded-md transition-all ${selectedType === "expense" ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300" : "text-muted-foreground hover:text-white"}`}
                onClick={() => { setValue("type", "expense"); setValue("category_id", ""); }}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={`flex-1 rounded-md transition-all ${selectedType === "income" ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300" : "text-muted-foreground hover:text-white"}`}
                onClick={() => { setValue("type", "income"); setValue("category_id", ""); }}
              >
                Income
              </Button>
            </div>

            {/* Amount */}
            <div className="space-y-3">
              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="pl-8 h-14 text-2xl font-mono font-medium bg-black/20 border-white/10"
                  {...register("amount")} 
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-500 font-mono">{errors.amount.message}</p>}
            </div>

            {/* Two Column Layout for Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select onValueChange={(v) => setValue("category_id", v)} defaultValue={editTransaction?.category_id}>
                  <SelectTrigger className="h-12 bg-black/20 border-white/10">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-rose-500 font-mono">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Date</Label>
                <Input type="date" className="h-12 bg-black/20 border-white/10 css-invert-calendar-icon" {...register("date")} />
                {errors.date && <p className="text-xs text-rose-500 font-mono">{errors.date.message}</p>}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Payment Method</Label>
              <Select onValueChange={(v) => setValue("payment_method", v)} defaultValue={editTransaction?.payment_method || "cash"}>
                <SelectTrigger className="h-12 bg-black/20 border-white/10">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Notes (Optional)</Label>
              <Input placeholder="E.g. Lunch at cafe" className="h-12 bg-black/20 border-white/10" {...register("description")} />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-border bg-surface-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1 h-12 font-bold tracking-wide uppercase text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="transaction-form" className="flex-1 h-12 font-bold tracking-wide uppercase text-xs bg-[var(--acid)] text-black hover:bg-[#b5cc18]" disabled={loading}>
            {loading ? "Processing..." : editTransaction ? "Save Changes" : "Confirm Addition"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}