export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--obsidian)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Acid glow orb top-right */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--acid-muted) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom-left dim orb */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #00FF8808 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Corner labels */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          left: "1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}
      >
        FINTRACK / AUTH
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "1.25rem",
          right: "1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.48rem",
          letterSpacing: "0.14em",
          color: "var(--text-tertiary)",
        }}
      >
        SECURE · ENCRYPTED · PRIVATE
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "460px" }}>
        {children}
      </div>
    </div>
  );
}