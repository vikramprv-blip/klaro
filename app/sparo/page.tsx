"use client"
import { useState } from "react"
import Link from "next/link"

const S: Record<string, React.CSSProperties> = {
  page:    { minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", fontFamily:"system-ui,sans-serif", overflowX:"hidden" },
  nav:     { position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", height:64, background:"rgba(10,15,30,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  hero:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" },
  h1:      { fontSize:"clamp(38px,6vw,72px)", fontWeight:900, lineHeight:1.04, letterSpacing:"-0.03em", marginBottom:22 },
  sub:     { fontSize:18, color:"#94A3B8", maxWidth:520, margin:"0 auto 44px", lineHeight:1.75 },
  section: { maxWidth:1100, margin:"0 auto", padding:"80px 40px" },
  card:    { background:"#1A2235", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 },
  footer:  { borderTop:"1px solid rgba(255,255,255,0.06)", padding:"28px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
}

const FEATURES = [
  { icon:"⚡", title:"Fee passthrough",      body:"Add the exact card fee to your invoice. Your client pays it — not you." },
  { icon:"🌏", title:"UPI + Cards + Stripe", body:"One link handles UPI, Razorpay, and Stripe. Works for any client anywhere." },
  { icon:"📱", title:"PWA — works offline",  body:"Install on home screen. Works without internet. Push notifications on payment." },
  { icon:"🤖", title:"AI assistant",         body:"Type what you need. Klaro creates and sends the link automatically." },
  { icon:"💬", title:"WhatsApp native",      body:"Share links on WhatsApp in one tap. Clients pay in 30 seconds." },
  { icon:"📊", title:"Full analytics",       body:"See every payment, every fee saved, every client at a glance." },
]

const PLANS = [
  { name:"Free",     inr:0,   usd:0,  links:"5 links/mo",  feat:["UPI only","Basic dashboard"],                        featured:false },
  { name:"Starter",  inr:499, usd:9,  links:"50 links/mo", feat:["UPI + Razorpay","No branding","Email reminders"],    featured:false },
  { name:"Pro",      inr:999, usd:15, links:"Unlimited",   feat:["All gateways","WhatsApp reminders","GST invoicing"], featured:true  },
  { name:"Business", inr:2499,usd:29, links:"Unlimited",   feat:["AI assistant","Team accounts","Accounting sync"],    featured:false },
]

export default function SparoPage() {
  const [currency, setCurrency] = useState<"INR"|"USD">("INR")

  return (
    <div style={S.page}>
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:700, height:450, background:"radial-gradient(ellipse,rgba(99,102,241,0.13) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>K</div>
            <span style={{ fontSize:13, color:"#94A3B8" }}>Klaro Tech</span>
          </Link>
          <span style={{ color:"rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize:15, fontWeight:800, color:"#F1F5F9" }}>Sparo</span>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <a href="#features" style={{ fontSize:14, color:"#94A3B8" }}>Features</a>
          <a href="#pricing"  style={{ fontSize:14, color:"#94A3B8" }}>Pricing</a>
          <Link href="/auth" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:13, padding:"8px 20px", borderRadius:9, textDecoration:"none" }}>Get started free</Link>
        </div>
      </nav>

      <section style={S.hero}>
        <div style={{ position:"relative", maxWidth:860 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:100, padding:"5px 16px", fontFamily:"monospace", fontSize:11, letterSpacing:"0.08em", color:"#818CF8", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:"#6366F1", borderRadius:"50%", animation:"pulse 2s infinite" }} />
            BY KLARO TECH · INDIA & ASIA FIRST
          </div>
          <h1 style={S.h1}>
            Stop losing money<br />to <span style={{ color:"#6366F1" }}>card fees.</span>
          </h1>
          <p style={S.sub}>Create a smart payment link in 30 seconds. Your client pays the processing fee — not you. Works with UPI, Razorpay, and Stripe.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/auth" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:15, padding:"13px 32px", borderRadius:10, textDecoration:"none" }}>Start free — no card needed</Link>
            <a href="#features" style={{ background:"transparent", color:"#F1F5F9", fontSize:15, padding:"13px 28px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", textDecoration:"none" }}>See how it works</a>
          </div>
          <div style={{ marginTop:36, display:"flex", alignItems:"center", justifyContent:"center", gap:24, flexWrap:"wrap", fontSize:13, color:"#94A3B8" }}>
            {["Free forever plan","No setup fees","Mobile PWA","UPI + Cards + Bank"].map(p => (
              <span key={p} style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ color:"#6366F1" }}>✓</span>{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={S.section}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>FEATURES</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>Everything a freelancer needs.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:48 }}>Built for Indian and Asian freelancers working with domestic and international clients.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={S.card}>
              <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ ...S.section, textAlign:"center" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>PRICING</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:16 }}>Simple pricing.</h2>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:36 }}>
          {(["INR","USD"] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{ padding:"6px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:currency===c?"#6366F1":"transparent", color:currency===c?"#fff":"#94A3B8", cursor:"pointer", fontSize:13, fontWeight:500 }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background:p.featured?"linear-gradient(160deg,#1E1B4B,#1A2235)":"#1A2235", border:p.featured?"2px solid #6366F1":"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"26px 22px", position:"relative" }}>
              {p.featured && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#6366F1", color:"#fff", fontFamily:"monospace", fontSize:10, fontWeight:700, padding:"3px 12px", borderRadius:100, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", color:"#6366F1", marginBottom:12 }}>{p.name.toUpperCase()}</p>
              <p style={{ fontSize:42, fontWeight:900, lineHeight:1, marginBottom:4 }}>{currency==="INR"?"₹":"$"}{currency==="INR"?p.inr:p.usd}</p>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:6 }}>/month</p>
              <p style={{ fontSize:12, color:"#6366F1", marginBottom:18, fontFamily:"monospace" }}>{p.links}</p>
              <ul style={{ listStyle:"none", padding:0, marginBottom:22 }}>
                {p.feat.map(f => <li key={f} style={{ fontSize:13, color:"#94A3B8", marginBottom:7, display:"flex", alignItems:"center", gap:7, textAlign:"left" }}><span style={{ color:"#6366F1" }}>✓</span>{f}</li>)}
              </ul>
              <Link href="/auth" style={{ display:"block", textAlign:"center", padding:"10px", borderRadius:9, fontSize:14, fontWeight:600, background:p.featured?"#6366F1":"transparent", border:p.featured?"none":"1px solid rgba(255,255,255,0.15)", color:"#fff", textDecoration:"none" }}>
                {p.inr===0?"Start free":"Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer style={S.footer}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/" style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>← Klaro Tech</Link>
          <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize:13, color:"#94A3B8" }}>Sparo by Klaro — Keep what you earn</span>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {["Privacy","Terms","Contact"].map(l => <a key={l} href="#" style={{ fontSize:13, color:"#94A3B8" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}
