"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, ArrowRight, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/"); router.refresh(); }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    backgroundColor: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    padding: "0.6rem 0.85rem",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      {/* Logo */}
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
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
          <LogIn size={13} style={{ color: "var(--acid)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
            Sign In
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "var(--text-tertiary)", letterSpacing: "0.14em", marginLeft: "auto" }}>
            01 / AUTH
          </span>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 animate-fade-in" style={{ backgroundColor: "var(--expense-bg)", border: "1px solid var(--expense)" }}>
              <AlertTriangle size={12} style={{ color: "var(--expense)", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--expense)", letterSpacing: "0.03em" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--acid)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--acid-muted)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--acid)", letterSpacing: "0.04em" }}>
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
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
              {loading ? "Authenticating…" : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
          </div>

          <button
            onClick={handleGoogle}
            className="btn-ghost flex items-center justify-center gap-2 w-full"
            style={{ padding: "0.6rem" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", padding: "0.85rem 1.5rem", backgroundColor: "var(--surface-2)", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-tertiary)" }}>
            No account?{" "}
            <Link href="/signup" style={{ color: "var(--acid)", letterSpacing: "0.04em" }}>
              Create one →
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}