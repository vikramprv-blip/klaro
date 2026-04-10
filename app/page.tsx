
"use client"
import { useState } from "react"
import Link from "next/link"

const S: Record<string, React.CSSProperties> = {
  page:    { minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", fontFamily:"system-ui,sans-serif", overflowX:"hidden" },
  nav:     { position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", height:64, background:"rgba(10,15,30,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  logoMark:{ width:34, height:34, borderRadius:9, background:"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff" },
  hero:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" },
  h1:      { fontSize:"clamp(38px,6vw,72px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:24 },
  sub:     { fontSize:18, color:"#94A3B8", maxWidth:520, margin:"0 auto 40px", lineHeight:1.75 },
  btnPri:  { background:"#6366F1", color:"#fff", fontWeight:700, fontSize:15, padding:"13px 32px", borderRadius:10, border:"none", cursor:"pointer", display:"inline-block", textDecoration:"none" },
  btnSec:  { background:"transparent", color:"#F1F5F9", fontSize:15, padding:"13px 28px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", display:"inline-block", textDecoration:"none" },
  section: { maxWidth:1100, margin:"0 auto", padding:"80px 32px" },
  card:    { background:"#1A2235", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28 },
  h2:      { fontSize:"clamp(28px,4vw,42px)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:12 },
  footer:  { borderTop:"1px solid rgba(255,255,255,0.06)", padding:"32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
}

const FEATURES = [
  { icon:"⚡", title:"Smart fee passthrough",   body:"Auto-calculate the exact card fee and add it to your invoice. Your client pays, not you." },
  { icon:"🌏", title:"India & global ready",     body:"UPI for India. Razorpay for domestic cards. Stripe for international clients. One link." },
  { icon:"📱", title:"Install like a native app", body:"Add to home screen. Get push notifications the moment you get paid." },
  { icon:"🤖", title:"AI payment assistant",     body:"Say \"charge Rahul ₹50,000, add 2.5% fee\" and Klaro does the rest." },
  { icon:"📊", title:"Full dashboard",           body:"Track every rupee. See which clients pay fast. Export for your CA." },
  { icon:"💬", title:"WhatsApp first",           body:"Share payment links directly on WhatsApp. Clients pay in 30 seconds." },
]

const PLANS = [
  { name:"Free",     inr:0,    usd:0,  links:"5 links/mo",  feat:["UPI only","Basic dashboard","Klaro branding"],                         featured:false },
  { name:"Starter",  inr:499,  usd:9,  links:"50 links/mo", feat:["UPI + Razorpay","No Klaro branding","Email reminders"],                featured:false },
  { name:"Pro",      inr:999,  usd:15, links:"Unlimited",   feat:["All gateways","WhatsApp reminders","GST invoicing"],                   featured:true  },
  { name:"Business", inr:2499, usd:29, links:"Unlimited",   feat:["AI assistant (LAM)","Team accounts","Accounting sync"],                featured:false },
]

export default function LandingPage() {
  const [currency, setCurrency] = useState<"INR"|"USD">("INR")
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={S.logoMark}>K</div>
          <span style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.02em" }}>klaro</span>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <a href="#features" style={{ fontSize:14, color:"#94A3B8" }}>Features</a>
          <a href="#pricing"  style={{ fontSize:14, color:"#94A3B8" }}>Pricing</a>
          <Link href="/auth" style={{ ...S.btnPri, padding:"8px 20px", fontSize:13 }}>Get started free</Link>
        </div>
      </nav>

      <section style={S.hero}>
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(99,102,241,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:800, position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:100, padding:"6px 18px", fontFamily:"monospace", fontSize:11, letterSpacing:"0.08em", color:"#818CF8", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:"#6366F1", borderRadius:"50%", animation:"pulse 2s infinite" }} />
            NOW IN EARLY ACCESS · INDIA & ASIA FIRST
          </div>
          <h1 style={S.h1}>Stop losing money<br />to <span style={{ color:"#6366F1" }}>card fees.</span></h1>
          <p style={S.sub}>Create a smart payment link in 30 seconds. Your client pays the processing fee — not you. Works with UPI, Razorpay, and Stripe.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/auth" style={S.btnPri}>Start free — no card needed</Link>
            <a href="#features" style={S.btnSec}>See how it works</a>
          </div>
          <div style={{ marginTop:40, display:"flex", alignItems:"center", justifyContent:"center", gap:24, flexWrap:"wrap", fontSize:13, color:"#94A3B8" }}>
            {["Free forever plan","No setup fees","Works on mobile","UPI + Cards + Bank"].map(p => (
              <span key={p} style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ color:"#6366F1" }}>✓</span> {p}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background:"rgba(99,102,241,0.04)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"48px 32px", textAlign:"center" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>THE MATH</p>
        <h2 style={{ ...S.h2, marginBottom:32 }}>How much are you losing right now?</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, maxWidth:700, margin:"0 auto" }}>
          {[["Per ₹1L invoice","₹2,500"],["Per month (5 invoices)","₹12,500"],["Per year","₹1,50,000"]].map(([label, amount]) => (
            <div key={label} style={{ background:"#1A2235", border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, padding:24 }}>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:8 }}>{label}</p>
              <p style={{ fontSize:13, color:"#EF4444", marginBottom:6 }}>Losing: {amount}</p>
              <p style={{ fontSize:20, fontWeight:800, color:"#10B981" }}>Save: {amount}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:"#94A3B8", marginTop:16 }}>Based on average 2.5% card processing fee</p>
      </section>

      <section id="features" style={S.section}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>FEATURES</p>
        <h2 style={S.h2}>Everything a freelancer needs.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:0 }}>Built for Indian and Asian freelancers working with domestic and international clients.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginTop:48 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={S.card}>
              <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ ...S.section, textAlign:"center" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:"#6366F1", marginBottom:10 }}>PRICING</p>
        <h2 style={S.h2}>Simple pricing. Massive savings.</h2>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20, marginBottom:0 }}>
          {(["INR","USD"] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{ padding:"6px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:currency===c?"#6366F1":"transparent", color:currency===c?"#fff":"#94A3B8", cursor:"pointer", fontSize:13, fontWeight:500 }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginTop:32 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background:p.featured?"linear-gradient(160deg,#1E1B4B,#1A2235)":"#1A2235", border:p.featured?"2px solid #6366F1":"1px solid rgba(255,255,255,0.08)", borderRadius:18, padding:"28px 24px", position:"relative" }}>
              {p.featured && <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:"#6366F1", color:"#fff", fontFamily:"monospace", fontSize:10, fontWeight:700, padding:"4px 14px", borderRadius:100, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", color:"#6366F1", marginBottom:14 }}>{p.name.toUpperCase()}</p>
              <p style={{ fontSize:44, fontWeight:800, lineHeight:1, marginBottom:4 }}>{currency==="INR"?"₹":"$"}{currency==="INR"?p.inr:p.usd}</p>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:6 }}>/month</p>
              <p style={{ fontSize:12, color:"#6366F1", marginBottom:20, fontFamily:"monospace" }}>{p.links}</p>
              <ul style={{ listStyle:"none", padding:0, marginBottom:24 }}>
                {p.feat.map(f => <li key={f} style={{ fontSize:13, color:"#94A3B8", marginBottom:8, display:"flex", alignItems:"center", gap:8, textAlign:"left" }}><span style={{ color:"#6366F1" }}>✓</span>{f}</li>)}
              </ul>
              <Link href="/auth" style={{ display:"block", textAlign:"center", padding:"11px", borderRadius:9, fontSize:14, fontWeight:600, background:p.featured?"#6366F1":"transparent", border:p.featured?"none":"1px solid rgba(255,255,255,0.15)", color:"#fff", textDecoration:"none" }}>
                {p.inr===0?"Start free":"Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer style={S.footer}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ ...S.logoMark, width:26, height:26, fontSize:12 }}>K</div>
          <span style={{ fontSize:13, color:"#94A3B8" }}>klaro.services — Keep what you earn</span>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {["Privacy","Terms","Contact"].map(l => <a key={l} href="#" style={{ fontSize:13, color:"#94A3B8" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}
