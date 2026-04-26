import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category_id: z.string().uuid("Please select a category"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  payment_method: z.string().default("cash"),
});

export const budgetSchema = z.object({
  category_id: z.string().uuid("Please select a category"),
  amount: z.coerce.number().positive("Budget must be greater than 0"),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
});

export const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  target_amount: z.coerce.number().positive("Target must be greater than 0"),
  target_date: z.string().optional(),
  icon: z.string().default("target"),
  color: z.string().default("#10b981"),
});

export const contributionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  note: z.string().optional(),
  date: z.string().optional(),
});

export const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type ContributionFormData = z.infer<typeof contributionSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;