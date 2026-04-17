"use client"
import { useState } from "react"
import Link from "next/link"

const COLOR = "#6366F1"
const FEATURES = [
  { icon:"⚡", title:"Fee passthrough",       body:"Auto-calculate the card fee and add it to your invoice. Your client pays it, not you." },
  { icon:"🌏", title:"UPI + Cards + Stripe",  body:"One link handles UPI, Razorpay, and Stripe. Works for any client anywhere in the world." },
  { icon:"📱", title:"PWA — install on phone", body:"Works offline. Push notifications when you get paid. Add to home screen like a native app." },
  { icon:"🤖", title:"AI assistant",          body:"Type what you need. Klaro creates and sends the link automatically." },
  { icon:"💬", title:"WhatsApp native",       body:"Share your payment link in one tap. Clients pay in 30 seconds from their phone." },
  { icon:"📊", title:"Full dashboard",        body:"See every payment, every fee saved, every client — in real time." },
]
const PLANS = [
  { name:"Free",     inr:0,   usd:0,  links:"5/mo",      feat:["UPI only","Basic dashboard"],                       hot:false },
  { name:"Starter",  inr:499, usd:9,  links:"50/mo",     feat:["UPI + Razorpay","No branding","Email reminders"],   hot:false },
  { name:"Pro",      inr:999, usd:15, links:"Unlimited", feat:["All gateways","WhatsApp reminders","GST invoicing"], hot:true  },
  { name:"Business", inr:2499,usd:29, links:"Unlimited", feat:["AI assistant","Team accounts","Accounting sync"],   hot:false },
]

export default function SparoLanding() {
  const [cur, setCur] = useState<"INR"|"USD">("INR")
  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", fontFamily:"system-ui,sans-serif", overflowX:"hidden" }}>
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:700, height:450, background:"radial-gradient(ellipse,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", height:64, background:"rgba(10,15,30,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#fff" }}>K</div>
            <span style={{ fontSize:13, color:"#94A3B8" }}>Klaro Tech</span>
          </Link>
          <span style={{ color:"rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize:15, fontWeight:800, color:"#F1F5F9" }}>Sparo</span>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <a href="#features" style={{ fontSize:14, color:"#94A3B8", textDecoration:"none" }}>Features</a>
          <a href="#pricing"  style={{ fontSize:14, color:"#94A3B8", textDecoration:"none" }}>Pricing</a>
          <Link href="/sparo/app" style={{ background:COLOR, color:"#fff", fontWeight:700, fontSize:13, padding:"8px 20px", borderRadius:9, textDecoration:"none" }}>Open Sparo →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" }}>
        <div style={{ maxWidth:860, position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:100, padding:"5px 16px", fontFamily:"monospace", fontSize:11, letterSpacing:"0.08em", color:"#818CF8", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:COLOR, borderRadius:"50%", animation:"pulse 2s infinite" }} />
            BY KLARO TECH · INDIA & ASIA FIRST
          </div>
          <h1 style={{ fontSize:"clamp(40px,7vw,80px)", fontWeight:900, lineHeight:1.03, letterSpacing:"-0.03em", marginBottom:22 }}>
            Stop losing money<br />to <span style={{ color:COLOR }}>card fees.</span>
          </h1>
          <p style={{ fontSize:18, color:"#94A3B8", maxWidth:500, margin:"0 auto 48px", lineHeight:1.75 }}>
            Create a smart payment link in 30 seconds. Your client pays the processing fee — not you. Works with UPI, Razorpay, and Stripe.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/sparo/app" style={{ background:COLOR, color:"#fff", fontWeight:700, fontSize:15, padding:"14px 36px", borderRadius:10, textDecoration:"none" }}>Start free — no card needed</Link>
            <a href="#features" style={{ background:"transparent", color:"#F1F5F9", fontSize:15, padding:"14px 28px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", textDecoration:"none" }}>See how it works</a>
          </div>
          <div style={{ marginTop:36, display:"flex", alignItems:"center", justifyContent:"center", gap:24, flexWrap:"wrap", fontSize:13, color:"#94A3B8" }}>
            {["Free forever","No setup fees","Mobile PWA","UPI + Cards + Bank"].map(p => (
              <span key={p} style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ color:COLOR }}>✓</span>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth:1100, margin:"0 auto", padding:"80px 48px" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:COLOR, marginBottom:10 }}>FEATURES</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>Everything a freelancer needs.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:48 }}>Built for Indian and Asian freelancers working with domestic and international clients.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 }}>
              <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth:1000, margin:"0 auto", padding:"60px 48px", textAlign:"center" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:COLOR, marginBottom:10 }}>PRICING</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:24 }}>Simple pricing.</h2>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:36 }}>
          {(["INR","USD"] as const).map(c => (
            <button key={c} onClick={() => setCur(c)} style={{ padding:"6px 18px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:cur===c?COLOR:"transparent", color:cur===c?"#fff":"#94A3B8", cursor:"pointer", fontSize:13, fontWeight:500 }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background:p.hot?"linear-gradient(160deg,#1E1B4B,#111827)":"#111827", border:p.hot?"2px solid "+COLOR:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"26px 20px", position:"relative" }}>
              {p.hot && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:COLOR, color:"#fff", fontFamily:"monospace", fontSize:9, fontWeight:700, padding:"3px 12px", borderRadius:100, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", color:COLOR, marginBottom:12 }}>{p.name.toUpperCase()}</p>
              <p style={{ fontSize:40, fontWeight:900, lineHeight:1, marginBottom:4 }}>{cur==="INR"?"₹":"$"}{cur==="INR"?p.inr:p.usd}</p>
              <p style={{ fontSize:11, color:"#94A3B8", marginBottom:6 }}>/month</p>
              <p style={{ fontSize:11, color:COLOR, marginBottom:16, fontFamily:"monospace" }}>{p.links}</p>
              <ul style={{ listStyle:"none", padding:0, marginBottom:20 }}>
                {p.feat.map(f => <li key={f} style={{ fontSize:12, color:"#94A3B8", marginBottom:7, display:"flex", alignItems:"center", gap:6, textAlign:"left" }}><span style={{ color:COLOR }}>✓</span>{f}</li>)}
              </ul>
              <Link href="/sparo/app" style={{ display:"block", textAlign:"center", padding:"10px", borderRadius:9, fontSize:13, fontWeight:600, background:p.hot?COLOR:"transparent", border:p.hot?"none":"1px solid rgba(255,255,255,0.12)", color:"#fff", textDecoration:"none" }}>
                {p.inr===0?"Start free":"Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ margin:"0 48px 80px", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:22, padding:"56px 48px", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>
          Start keeping what you earn.
        </h2>
        <p style={{ fontSize:15, color:"#94A3B8", marginBottom:32 }}>Free forever. No credit card. Takes 2 minutes to set up.</p>
        <Link href="/sparo/app" style={{ background:COLOR, color:"#fff", fontWeight:700, fontSize:15, padding:"14px 36px", borderRadius:10, textDecoration:"none" }}>Open Sparo free →</Link>
      </div>

      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"28px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/" style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>← Klaro Tech</Link>
          <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize:13, color:"#94A3B8" }}>Sparo by Klaro — Keep what you earn</span>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {([["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"],["Contact","mailto:hello@klaro.services"]]).map(([l,href]) => <a key={l} href={href} style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}
