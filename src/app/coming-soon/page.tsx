export const metadata = { title: "Coming Soon · SimUniverse" };

export default function ComingSoonPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#050507",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 900px 600px at 20% 20%, rgba(46,125,255,0.18), transparent 60%), radial-gradient(ellipse 600px 400px at 80% 80%, rgba(0,224,255,0.07), transparent 60%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 48 }}>
          <div style={{ width: 3, height: 28, background: "#2e7dff", borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 3, color: "#2e7dff", textTransform: "uppercase" }}>
            SimUniverse
          </span>
        </div>

        {/* badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(46,125,255,0.1)", border: "1px solid rgba(46,125,255,0.3)",
          borderRadius: 20, padding: "6px 16px", marginBottom: 32,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2e7dff" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#2e7dff", textTransform: "uppercase" }}>
            Coming Soon
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
          fontWeight: 800,
          color: "#f5f7fa",
          lineHeight: 1.1,
          margin: "0 0 20px",
          letterSpacing: "-0.02em",
        }}>
          Qualcosa di grande<br />sta arrivando.
        </h1>

        <p style={{ fontSize: "1.05rem", color: "#7d8694", lineHeight: 1.7, margin: "0 0 40px" }}>
          La community italiana del sim racing si sta preparando.<br />
          Seguici per non perderti il lancio.
        </p>

        {/* feature pills */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          {["🏆 Tornei", "⚙️ Assetti", "👥 Team", "📖 Guide"].map((f) => (
            <span key={f} style={{
              background: "rgba(46,125,255,0.08)", border: "1px solid rgba(46,125,255,0.25)",
              borderRadius: 8, padding: "8px 16px",
              fontSize: 14, fontWeight: 600, color: "#2e7dff",
            }}>{f}</span>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "#3d4551" }}>simuniverse.it</p>
      </div>

      {/* bottom bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "#2e7dff" }} />
    </div>
  );
}
