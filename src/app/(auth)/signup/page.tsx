"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, ArrowRight, UserPlus, Mail } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: "0.78rem",
    backgroundColor: "var(--surface-2)", border: "1px solid var(--border)",
    color: "var(--text-primary)", padding: "0.6rem 0.85rem",
    width: "100%", outline: "none", transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };

  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--acid)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--acid-muted)"; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; };

  if (success) {
    return (
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--income)" }}>
          <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--income)", backgroundColor: "var(--income-bg)" }}>
            <Mail size={13} style={{ color: "var(--income)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--income)" }}>
              Check Your Email
            </span>
          </div>
          <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-secondary)", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
              A confirmation link was sent to{" "}
              <span style={{ color: "var(--acid)" }}>{email}</span>.
              Click the link to activate your account.
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
          <UserPlus size={13} style={{ color: "var(--acid)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
            Create Account
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--text-tertiary)", letterSpacing: "0.14em", marginLeft: "auto" }}>
            02 / AUTH
          </span>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 animate-fade-in" style={{ backgroundColor: "var(--expense-bg)", border: "1px solid var(--expense)" }}>
              <AlertTriangle size={12} style={{ color: "var(--expense)", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--expense)" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Full Name", type: "text", val: fullName, set: setFullName, placeholder: "John Doe" },
              { label: "Email Address", type: "email", val: email, set: setEmail, placeholder: "you@example.com" },
              { label: "Password", type: "password", val: password, set: setPassword, placeholder: "Min. 6 characters" },
            ].map(({ label, type, val, set, placeholder }) => (
              <div key={label}>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: "0.4rem" }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  required
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-acid flex items-center justify-center gap-2 w-full"
              style={{ padding: "0.65rem", opacity: loading ? 0.7 : 1, marginTop: "0.25rem" }}
            >
              {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight size={13} /></>}
            </button>
          </form>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", padding: "0.85rem 1.5rem", backgroundColor: "var(--surface-2)", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-tertiary)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--acid)" }}>Sign in →</Link>
          </span>
        </div>
      </div>
    </div>
  );
}