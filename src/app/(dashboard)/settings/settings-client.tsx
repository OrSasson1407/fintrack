"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES } from "@/lib/constants";
import type { Profile } from "@/types";

interface SettingsClientProps {
  profile: Profile;
  email: string;
}

export function SettingsClient({ profile, email }: SettingsClientProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [currency, setCurrency] = useState(profile.currency);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setLoading(false);
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleExport = async () => {
    setExportLoading(true);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, category:categories(name)")
      .eq("user_id", profile.id)
      .order("date", { ascending: false });

    if (transactions && transactions.length > 0) {
      const csv = [
        "Date,Type,Category,Amount,Description,Payment Method",
        ...transactions.map((t) =>
          `${t.date},${t.type},${t.category?.name || ""},${t.amount},"${t.description || ""}",${t.payment_method}`
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintrack-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action CANNOT be undone. All your data will be permanently removed."
    );
    if (!confirmed) return;

    const doubleConfirm = confirm("This is your LAST chance. Delete account permanently?");
    if (!doubleConfirm) return;

    await supabase.from("goal_contributions").delete().eq("user_id", profile.id);
    await supabase.from("goals").delete().eq("user_id", profile.id);
    await supabase.from("budgets").delete().eq("user_id", profile.id);
    await supabase.from("transactions").delete().eq("user_id", profile.id);
    await supabase.from("categories").delete().eq("user_id", profile.id);
    await supabase.from("profiles").delete().eq("id", profile.id);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-slate-50 dark:bg-slate-900" />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          {success && <p className="text-sm text-emerald-600">Settings saved successfully!</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">Download all your transactions as a CSV file.</p>
          <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? "Exporting..." : "Export to CSV"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}