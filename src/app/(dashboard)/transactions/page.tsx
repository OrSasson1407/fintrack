import { createClient } from "@/lib/supabase/server";
import { TransactionList } from "@/components/transactions/transaction-list";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user?.id ?? "")
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user?.id ?? "")
    .order("date", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-label-sm mb-1 text-acid">OVERVIEW</h2>
        <h1 className="text-display-md">TRANSACTIONS</h1>
      </div>
      <TransactionList
        transactions={transactions || []}
        categories={categories || []}
        currency={profile?.currency || "USD"}
        userId={user?.id ?? ""}
      />
    </div>
  );
}