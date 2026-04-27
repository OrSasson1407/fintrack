"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, ArrowRight, KeyRound, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) { setError(error.message); }
    else { setSent(true); }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--income)" }}>
          <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--income)", backgroundColor: "var(--income-bg)" }}>
            <Mail size={13} style={{ color: "var(--income)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--income)" }}>
              Link Sent
            </span>
          </div>
          <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-secondary)", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
              If an account exists for{" "}
              <span style={{ color: "var(--acid)" }}>{email}</span>,
              a password reset link has been sent.
            </div>
            <Link href="/login">
              <button className="btn-ghost" style={{ fontSize: "0.65rem" }}>← Back to Sign In</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
          Personal Finance OS
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "3rem", lineHeight: 1, letterSpacing: "0.04em" }}>
          <span style={{ color: "var(--acid)" }}>FIN</span>
          <span style={{ color: "var(--text-primary)" }}>TRACK</span>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
          <KeyRound size={13} style={{ color: "var(--acid)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
            Reset Password
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--text-tertiary)", letterSpacing: "0.14em", marginLeft: "auto" }}>
            03 / AUTH
          </span>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 animate-fade-in" style={{ backgroundColor: "var(--expense-bg)", border: "1px solid var(--expense)" }}>
              <AlertTriangle size={12} style={{ color: "var(--expense)", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--expense)" }}>{error}</span>
            </div>
          )}

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-secondary)", letterSpacing: "0.03em", marginBottom: "1.25rem" }}>
            Enter your email and we'll send a link to reset your password.
          </p>

          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: "0.4rem" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.78rem",
                  backgroundColor: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--text-primary)", padding: "0.6rem 0.85rem",
                  width: "100%", outline: "none", transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--acid)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--acid-muted)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-acid flex items-center justify-center gap-2 w-full"
              style={{ padding: "0.65rem", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Sending…" : <><span>Send Reset Link</span><ArrowRight size={13} /></>}
            </button>
          </form>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", padding: "0.85rem 1.5rem", backgroundColor: "var(--surface-2)", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-tertiary)" }}>
            Remember your password?{" "}
            <Link href="/login" style={{ color: "var(--acid)" }}>Sign in →</Link>
          </span>
        </div>
      </div>
    </div>
  );
}