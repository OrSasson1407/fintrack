"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/constants";
import type { Profile } from "@/types";
import { Check, Download, AlertTriangle, User, Database, ShieldAlert } from "lucide-react";

interface SettingsClientProps {
  profile: Profile;
  email: string;
}

function SectionHeader({ code, title, icon: Icon }: { code: string; title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--text-tertiary)", letterSpacing: "0.18em" }}>{code}</span>
      <Icon size={12} style={{ color: "var(--text-secondary)" }} />
      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
        {title}
      </span>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", marginTop: "3px", letterSpacing: "0.04em" }}>
            {hint}
          </div>
        )}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

export function SettingsClient({ profile, email }: SettingsClientProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [currency, setCurrency] = useState(profile.currency);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteStage, setDeleteStage] = useState(0); // 0 = idle, 1 = first confirm, 2 = deleting
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    await supabase.from("profiles").update({ full_name: fullName, currency, updated_at: new Date().toISOString() }).eq("id", profile.id);
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = async () => {
    setExportLoading(true);
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, category:categories(name)")
      .eq("user_id", profile.id)
      .order("date", { ascending: false });

    if (transactions?.length) {
      const csv = [
        "Date,Type,Category,Amount,Description,Payment Method",
        ...transactions.map((t) => `${t.date},${t.type},${t.category?.name || ""},${t.amount},"${t.description || ""}",${t.payment_method}`),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintrack-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportLoading(false);
  };

  const handleDelete = async () => {
    if (deleteStage === 0) { setDeleteStage(1); return; }
    setDeleteStage(2);
    await supabase.from("goal_contributions").delete().eq("user_id", profile.id);
    await supabase.from("goals").delete().eq("user_id", profile.id);
    await supabase.from("budgets").delete().eq("user_id", profile.id);
    await supabase.from("transactions").delete().eq("user_id", profile.id);
    await supabase.from("categories").delete().eq("user_id", profile.id);
    await supabase.from("profiles").delete().eq("id", profile.id);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    backgroundColor: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    padding: "0.45rem 0.75rem",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "680px" }}>

      {/* Profile section */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <SectionHeader code="06A" title="Profile" icon={User} />

        <FieldRow label="Email" hint="Cannot be changed">
          <input
            value={email}
            disabled
            style={{ ...inputStyle, backgroundColor: "var(--surface-3)", color: "var(--text-tertiary)", cursor: "not-allowed" }}
          />
        </FieldRow>

        <FieldRow label="Full Name" hint="Displayed across the app">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--acid)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </FieldRow>

        <FieldRow label="Currency" hint="Used for all amounts">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 0,
              color: "var(--text-primary)",
              height: "auto",
              padding: "0.45rem 0.75rem",
            }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 0 }}>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code} style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>
                  {c.symbol} {c.name} ({c.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        {/* Save row */}
        <div className="flex items-center justify-between px-5 py-4">
          {saved ? (
            <div className="flex items-center gap-2">
              <Check size={13} style={{ color: "var(--income)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--income)", letterSpacing: "0.06em" }}>
                Changes saved
              </span>
            </div>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-tertiary)" }}>
              {loading ? "Saving…" : "Unsaved changes will be lost"}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-acid"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Data export section */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <SectionHeader code="06B" title="Data Export" icon={Database} />
        <div className="px-5 py-5">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-secondary)", letterSpacing: "0.03em", marginBottom: "1rem" }}>
            Download all your transactions as a CSV file for use in spreadsheets or other tools.
          </p>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="btn-ghost flex items-center gap-2"
            style={{ opacity: exportLoading ? 0.6 : 1 }}
          >
            <Download size={12} />
            <span>{exportLoading ? "Exporting…" : "Export Transactions as CSV"}</span>
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--expense)" }}>
        <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--expense)", backgroundColor: "var(--expense-bg)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--expense)", letterSpacing: "0.18em" }}>06C</span>
          <ShieldAlert size={12} style={{ color: "var(--expense)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--expense)" }}>
            Danger Zone
          </span>
        </div>

        <div className="px-5 py-5">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-secondary)", letterSpacing: "0.03em", marginBottom: "1.25rem" }}>
            Permanently delete your account and all data — transactions, budgets, goals, and categories.
            This action cannot be undone.
          </p>

          {deleteStage === 1 && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2.5" style={{ backgroundColor: "var(--expense-bg)", border: "1px solid var(--expense)" }}>
              <AlertTriangle size={12} style={{ color: "var(--expense)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--expense)", letterSpacing: "0.04em" }}>
                This will erase all your data permanently. Click again to confirm.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleteStage === 2}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.5rem 1.25rem",
                backgroundColor: deleteStage === 1 ? "var(--expense)" : "transparent",
                color: deleteStage === 1 ? "var(--text-primary)" : "var(--expense)",
                border: "1px solid var(--expense)",
                cursor: deleteStage === 2 ? "not-allowed" : "pointer",
                opacity: deleteStage === 2 ? 0.5 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {deleteStage === 0 && "Delete Account"}
              {deleteStage === 1 && "⚠ Confirm Permanent Deletion"}
              {deleteStage === 2 && "Deleting…"}
            </button>
            {deleteStage === 1 && (
              <button className="btn-ghost" style={{ fontSize: "0.62rem" }} onClick={() => setDeleteStage(0)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}