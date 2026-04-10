"use client"
import Link from "next/link"

const APPS = [
  {
    id:       "sparo",
    label:    "SPARO",
    name:     "Smart Payment Links",
    tagline:  "Stop losing money to card fees",
    desc:     "Create a payment link in 30 seconds. Your client pays the processing fee — not you. Works with UPI, Razorpay, and Stripe.",
    icon:     "⚡",
    color:    "#6366F1",
    bg:       "rgba(99,102,241,0.08)",
    border:   "rgba(99,102,241,0.25)",
    tag:      "LIVE",
    tagColor: "#10B981",
    tagBg:    "rgba(16,185,129,0.12)",
    href:     "/sparo",
    appHref:  "/sparo/app",
    features: ["UPI + Razorpay + Stripe", "Fee passthrough in one link", "WhatsApp sharing", "GST invoicing"],
  },
  {
    id:       "varo",
    label:    "VARO",
    name:     "AI Collections Agent",
    tagline:  "Stop chasing. Let AI collect.",
    desc:     "Varo sends invoices, chases payments, handles client replies, and negotiates payment plans — all automatically on WhatsApp.",
    icon:     "🤖",
    color:    "#8B5CF6",
    bg:       "rgba(139,92,246,0.08)",
    border:   "rgba(139,92,246,0.25)",
    tag:      "LIVE",
    tagColor: "#10B981",
    tagBg:    "rgba(16,185,129,0.12)",
    href:     "/varo",
    appHref:  "/varo/app",
    features: ["AI WhatsApp collections", "Payment plan negotiation", "Tally / Zoho / QuickBooks sync", "Auto-chase schedule"],
  },
]

const STATS = [
  { v:"₹0",   l:"Setup cost" },
  { v:"2.5%", l:"Average fee saved per invoice" },
  { v:"30s",  l:"To create a payment link" },
  { v:"68%",  l:"Invoices paid faster with AI" },
]

export default function KlaroHome() {
  return (
    <div style={{ minHeight:"100vh", background:"#050810", color:"#F1F5F9", fontFamily:"system-ui,sans-serif", overflowX:"hidden" }}>

      {/* Glow */}
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:900, height:500, background:"radial-gradient(ellipse,rgba(99,102,241,0.08) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", height:64, background:"rgba(5,8,16,0.94)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#fff" }}>K</div>
          <span style={{ fontSize:17, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>Klaro</span>
          <span style={{ fontSize:10, fontFamily:"monospace", color:"#6366F1", letterSpacing:"0.1em" }}>TECH</span>
        </div>
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          <a href="#products" style={{ fontSize:14, color:"#94A3B8", textDecoration:"none" }}>Products</a>
          <a href="#about"    style={{ fontSize:14, color:"#94A3B8", textDecoration:"none" }}>About</a>
          <Link href="/auth"  style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:13, padding:"8px 20px", borderRadius:9, textDecoration:"none" }}>Sign in</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" }}>
        <div style={{ maxWidth:860, position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:100, padding:"5px 18px", fontFamily:"monospace", fontSize:11, letterSpacing:"0.08em", color:"#818CF8", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:"#6366F1", borderRadius:"50%", animation:"pulse 2s infinite" }} />
            KLARO TECH · FINANCIAL TOOLS FOR EMERGING MARKETS
          </div>
          <h1 style={{ fontSize:"clamp(42px,6.5vw,80px)", fontWeight:900, lineHeight:1.02, letterSpacing:"-0.03em", marginBottom:20 }}>
            Financial tools built<br />
            <span style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              for the real world.
            </span>
          </h1>
          <p style={{ fontSize:18, color:"#94A3B8", maxWidth:520, margin:"0 auto 44px", lineHeight:1.75 }}>
            We build simple, powerful financial software for freelancers, agencies and small businesses across India, Southeast Asia and beyond.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/sparo" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:15, padding:"13px 32px", borderRadius:10, textDecoration:"none" }}>Explore Sparo →</Link>
            <Link href="/varo"  style={{ background:"rgba(139,92,246,0.15)", color:"#C4B5FD", fontWeight:700, fontSize:15, padding:"13px 32px", borderRadius:10, textDecoration:"none", border:"1px solid rgba(139,92,246,0.3)" }}>Explore Varo →</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:"rgba(99,102,241,0.04)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"48px 48px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32, textAlign:"center" }}>
          {STATS.map(s => (
            <div key={s.l}>
              <p style={{ fontSize:44, fontWeight:900, letterSpacing:"-0.03em", color:"#6366F1", marginBottom:6 }}>{s.v}</p>
              <p style={{ fontSize:14, color:"#94A3B8" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" style={{ maxWidth:1100, margin:"0 auto", padding:"90px 48px" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>OUR PRODUCTS</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>Tools that pay for themselves.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:56 }}>Each product solves one real problem. No bloat, no subscriptions you will not use.</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          {APPS.map(app => (
            <div key={app.id} style={{ background:app.bg, border:"1px solid "+app.border, borderRadius:20, padding:36, display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:app.color+"20", border:"1px solid "+app.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{app.icon}</div>
                  <div>
                    <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:app.color, marginBottom:3 }}>{app.label}</p>
                    <h3 style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.02em", color:"#F1F5F9" }}>{app.name}</h3>
                    <p style={{ fontSize:13, color:"#94A3B8" }}>{app.tagline}</p>
                  </div>
                </div>
                <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:100, background:app.tagBg, color:app.tagColor, flexShrink:0 }}>{app.tag}</span>
              </div>

              <p style={{ fontSize:15, color:"#94A3B8", lineHeight:1.7, marginBottom:24, flex:1 }}>{app.desc}</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:28 }}>
                {app.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#94A3B8" }}>
                    <span style={{ color:app.color, fontSize:12 }}>✓</span>{f}
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <Link href={app.href} style={{ flex:1, textAlign:"center", padding:"11px", borderRadius:9, fontSize:14, fontWeight:600, background:"transparent", border:"1px solid "+app.border, color:app.color, textDecoration:"none" }}>
                  Learn more
                </Link>
                <Link href={app.appHref} style={{ flex:2, textAlign:"center", padding:"11px", borderRadius:9, fontSize:14, fontWeight:700, background:app.color, color:"#fff", textDecoration:"none" }}>
                  Open {app.label} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ maxWidth:700, margin:"0 auto", padding:"60px 48px", textAlign:"center" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>ABOUT KLARO TECH</p>
        <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:16 }}>Built for markets that matter.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", lineHeight:1.8 }}>
          Klaro Tech builds financial tools for freelancers and small businesses in India, Southeast Asia, and emerging markets worldwide. Every product solves one problem, works on a basic smartphone, and pays for itself within the first use.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"28px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>K</div>
          <span style={{ fontSize:13, color:"#94A3B8" }}>Klaro Tech · Financial tools for emerging markets</span>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {([["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"],["Contact","mailto:hello@klaro.services"]]).map(([l,href]) => <a key={l} href={href} style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}
