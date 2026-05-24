export const metadata = { title: "Coming Soon · SimUniverse" };

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export default function ComingSoonPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#050507", fontFamily: "var(--font-body), system-ui, sans-serif",
      textAlign: "center", padding: "2rem",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-40px) scale(1.08); }
          66%      { transform: translate(-20px,20px) scale(.95); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-40px,30px) scale(1.1); }
          70%      { transform: translate(25px,-25px) scale(.93); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,40px) scale(1.05); }
        }
        @keyframes twinkle {
          0%,100% { opacity:.15; transform:scale(1); }
          50%      { opacity:.7;  transform:scale(1.4); }
        }
        @keyframes drift {
          0%   { transform:translateY(0) translateX(0); }
          25%  { transform:translateY(-18px) translateX(10px); }
          50%  { transform:translateY(-30px) translateX(-8px); }
          75%  { transform:translateY(-14px) translateX(12px); }
          100% { transform:translateY(0) translateX(0); }
        }
        .ig-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 12px 40px rgba(131,58,180,.55) !important;
        }
      `}</style>

      {/* ── Orbi fluttuanti ── */}
      <div style={{
        position:"absolute", top:"-10%", left:"-10%",
        width:600, height:600, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(46,125,255,.22) 0%, transparent 70%)",
        animation:"float1 14s ease-in-out infinite", filter:"blur(8px)",
      }}/>
      <div style={{
        position:"absolute", bottom:"-15%", right:"-8%",
        width:520, height:520, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,224,255,.14) 0%, transparent 70%)",
        animation:"float2 18s ease-in-out infinite", filter:"blur(10px)",
      }}/>
      <div style={{
        position:"absolute", top:"40%", right:"5%",
        width:320, height:320, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(46,125,255,.12) 0%, transparent 70%)",
        animation:"float3 11s ease-in-out infinite", filter:"blur(6px)",
      }}/>
      <div style={{
        position:"absolute", bottom:"20%", left:"3%",
        width:240, height:240, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,224,255,.09) 0%, transparent 70%)",
        animation:"float1 16s ease-in-out infinite 3s", filter:"blur(8px)",
      }}/>

      {/* ── Particelle puntiformi ── */}
      {[
        { top:"18%", left:"22%", s:4,  d:"0s",   dur:"4s"  },
        { top:"72%", left:"68%", s:3,  d:"1.5s", dur:"5s"  },
        { top:"35%", left:"78%", s:5,  d:"0.8s", dur:"3.5s"},
        { top:"55%", left:"14%", s:3,  d:"2.2s", dur:"6s"  },
        { top:"82%", left:"38%", s:4,  d:"0.3s", dur:"4.5s"},
        { top:"12%", left:"58%", s:3,  d:"1.8s", dur:"5.5s"},
        { top:"65%", left:"88%", s:5,  d:"0.6s", dur:"3.8s"},
        { top:"44%", left:"45%", s:2,  d:"2.5s", dur:"7s"  },
        { top:"28%", left:"5%",  s:3,  d:"1.2s", dur:"4.2s"},
        { top:"90%", left:"78%", s:4,  d:"0.9s", dur:"5.8s"},
      ].map((p,i) => (
        <div key={i} style={{
          position:"absolute", top:p.top, left:p.left,
          width:p.s, height:p.s, borderRadius:"50%",
          background:"rgba(46,125,255,.6)",
          animation:`twinkle ${p.dur} ease-in-out infinite ${p.d}`,
        }}/>
      ))}

      {/* ── Contenuto ── */}
      <div style={{ position:"relative", zIndex:1, maxWidth:560 }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:48 }}>
          <div style={{ width:3, height:28, background:"#2e7dff", borderRadius:2 }}/>
          <span style={{ fontSize:13, fontWeight:800, letterSpacing:3, color:"#2e7dff", textTransform:"uppercase" }}>
            SimUniverse
          </span>
        </div>

        {/* Badge coming soon */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(46,125,255,.1)", border:"1px solid rgba(46,125,255,.3)",
          borderRadius:20, padding:"6px 18px", marginBottom:36,
          animation:"drift 8s ease-in-out infinite",
        }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#2e7dff" }}/>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:2.5, color:"#2e7dff", textTransform:"uppercase" }}>
            Coming Soon
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:"clamp(2.4rem,6vw,3.8rem)", fontWeight:800,
          color:"#f5f7fa", lineHeight:1.1, margin:"0 0 20px",
          letterSpacing:"-0.02em",
        }}>
          Qualcosa di grande<br/>sta arrivando.
        </h1>

        {/* Sottotitolo */}
        <p style={{ fontSize:"1.05rem", color:"#7d8694", lineHeight:1.75, margin:"0 0 44px" }}>
          La community italiana del sim racing si sta preparando.<br/>
          Seguici per non perderti il lancio.
        </p>

        {/* Bottone Instagram */}
        <a
          href="https://www.instagram.com/simuniverse.it"
          target="_blank"
          rel="noopener noreferrer"
          className="ig-btn"
          style={{
            display:"inline-flex", alignItems:"center", gap:12,
            background:"linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)",
            color:"#fff", fontWeight:700, fontSize:"1rem",
            padding:"14px 28px", borderRadius:14,
            textDecoration:"none", boxShadow:"0 8px 32px rgba(131,58,180,.35)",
            transition:"transform .2s, box-shadow .2s",
          }}
        >
          <InstagramIcon/>
          Seguici su Instagram @simuniverse.it
        </a>

        <p style={{ fontSize:13, color:"#2a2f38", marginTop:48 }}>simuniverse.it</p>
      </div>

      {/* Barra blu in fondo */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:"#2e7dff" }}/>
    </div>
  );
}
