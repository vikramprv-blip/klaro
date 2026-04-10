"use client"
import { useState } from "react"
import Link from "next/link"

const S: Record<string, React.CSSProperties> = {
  page:    { minHeight:"100vh", background:"#050810", color:"#F1F5F9", fontFamily:"system-ui,sans-serif", overflowX:"hidden" },
  nav:     { position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", height:64, background:"rgba(5,8,16,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  logoMark:{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:18, color:"#fff", letterSpacing:"-0.02em" },
  hero:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" },
  h1:      { fontSize:"clamp(42px,6.5vw,80px)", fontWeight:900, lineHeight:1.02, letterSpacing:"-0.03em", marginBottom:20 },
  sub:     { fontSize:18, color:"#94A3B8", maxWidth:540, margin:"0 auto 48px", lineHeight:1.75 },
  section: { maxWidth:1100, margin:"0 auto", padding:"90px 40px" },
  appCard: { background:"#0D1117", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:36, position:"relative", overflow:"hidden", transition:"border-color 0.2s" },
  tag:     { fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", padding:"4px 12px", borderRadius:100, fontWeight:600 },
  footer:  { borderTop:"1px solid rgba(255,255,255,0.06)", padding:"32px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
}

const APPS = [
  {
    name:     "Sparo",
    tagline:  "Smart Payment Links",
    desc:     "Stop losing money to card fees. Create a payment link in 30 seconds — your client pays the processing fee, not you. Built for Indian and Asian freelancers.",
    tag:      "LIVE",
    tagColor: "#10B981",
    tagBg:    "rgba(16,185,129,0.12)",
    accent:   "#6366F1",
    accentBg: "rgba(99,102,241,0.08)",
    icon:     "⚡",
    href:     "/sparo",
    features: ["UPI + Razorpay + Stripe","Fee passthrough in one link","WhatsApp sharing","GST invoicing"],
    cta:      "Start free →",
  },
  {
    name:     "Coming Soon",
    tagline:  "More tools in the pipeline",
    desc:     "We are building a suite of financial tools for freelancers, agencies, and small businesses across India and Southeast Asia.",
    tag:      "COMING SOON",
    tagColor: "#F59E0B",
    tagBg:    "rgba(245,158,11,0.12)",
    accent:   "#F59E0B",
    accentBg: "rgba(245,158,11,0.04)",
    icon:     "🔮",
    href:     "#",
    features: ["Expense tracking","Multi-currency invoicing","Tax automation","Team payments"],
    cta:      "Get notified →",
  },
]

const STATS = [
  { value:"₹0",   label:"Setup cost" },
  { value:"2.5%", label:"Average fee saved per invoice" },
  { value:"30s",  label:"To create a payment link" },
  { value:"3",    label:"Payment methods in one link" },
]

export default function KlaroHomePage() {
  return (
    <div style={S.page}>

      {/* Glow */}
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:800, height:400, background:"radial-gradient(ellipse,rgba(99,102,241,0.08) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={S.logoMark}>K</div>
          <div>
            <span style={{ fontSize:17, fontWeight:800, letterSpacing:"-0.02em" }}>Klaro</span>
            <span style={{ fontSize:11, color:"#6366F1", fontFamily:"monospace", marginLeft:8 }}>TECH</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:28, alignItems:"center" }}>
          <a href="#apps"  style={{ fontSize:14, color:"#94A3B8" }}>Products</a>
          <a href="#about" style={{ fontSize:14, color:"#94A3B8" }}>About</a>
          <Link href="/sparo" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:13, padding:"8px 20px", borderRadius:9, textDecoration:"none" }}>
            Try Sparo free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={S.hero}>
        <div style={{ position:"relative", maxWidth:860 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:100, padding:"5px 16px", fontFamily:"monospace", fontSize:11, letterSpacing:"0.08em", color:"#818CF8", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:"#6366F1", borderRadius:"50%", animation:"pulse 2s infinite" }} />
            KLARO TECH · FINANCIAL TOOLS FOR EMERGING MARKETS
          </div>
          <h1 style={S.h1}>
            Financial tools built for<br />
            <span style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              the real world.
            </span>
          </h1>
          <p style={S.sub}>
            We build simple, powerful financial software for freelancers, agencies and small businesses
            across India, Southeast Asia and beyond.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/sparo" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:15, padding:"13px 32px", borderRadius:10, textDecoration:"none" }}>
              Try Sparo — it is free
            </Link>
            <a href="#apps" style={{ background:"transparent", color:"#F1F5F9", fontSize:15, padding:"13px 28px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", textDecoration:"none" }}>
              See all products
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:"rgba(99,102,241,0.04)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"48px 40px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:32, textAlign:"center" }}>
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ fontSize:40, fontWeight:900, letterSpacing:"-0.03em", color:"#6366F1", marginBottom:6 }}>{s.value}</p>
              <p style={{ fontSize:14, color:"#94A3B8" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APPS */}
      <section id="apps" style={S.section}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>OUR PRODUCTS</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>Tools that pay for themselves.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:56 }}>Each product solves one real problem. No bloat, no subscriptions you will not use.</p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:20 }}>
          {APPS.map(app => (
            <div key={app.name} style={{ ...S.appCard, background:app.accentBg, borderColor:"rgba(255,255,255,0.08)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                    {app.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.02em", marginBottom:2 }}>{app.name}</h3>
                    <p style={{ fontSize:13, color:"#94A3B8" }}>{app.tagline}</p>
                  </div>
                </div>
                <span style={{ ...S.tag, background:app.tagBg, color:app.tagColor }}>{app.tag}</span>
              </div>

              <p style={{ fontSize:15, color:"#94A3B8", lineHeight:1.7, marginBottom:24 }}>{app.desc}</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:28 }}>
                {app.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#94A3B8" }}>
                    <span style={{ color:app.accent, fontSize:12 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <Link href={app.href} style={{ display:"inline-flex", alignItems:"center", gap:6, background:app.accent, color:"#fff", fontWeight:700, fontSize:14, padding:"11px 24px", borderRadius:9, textDecoration:"none" }}>
                {app.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...S.section, textAlign:"center", maxWidth:700 }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>ABOUT KLARO TECH</p>
        <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:16 }}>Built for markets that matter.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", lineHeight:1.8, marginBottom:16 }}>
          Klaro Tech builds financial tools for freelancers and small businesses in India, Southeast Asia, and emerging markets worldwide.
          We focus on the problems that big fintech ignores — the 15 million Indian freelancers losing thousands every year to payment fees,
          the agency that cannot get a Stripe account, the consultant who just needs a clean payment link.
        </p>
        <p style={{ fontSize:16, color:"#94A3B8", lineHeight:1.8 }}>
          Every product we build solves one problem, works on a basic smartphone, and pays for itself within the first use.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ ...S.logoMark, width:28, height:28, fontSize:14 }}>K</div>
          <span style={{ fontSize:13, color:"#94A3B8" }}>Klaro Tech · Financial tools for emerging markets</span>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize:13, color:"#94A3B8" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
