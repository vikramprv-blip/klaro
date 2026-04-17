"use client"
import Link from "next/link"

const COLOR = "#8B5CF6"
const FLOW = [
  { day:"Day 0",  icon:"📤", title:"Invoice sent",       body:"Varo sends your invoice via WhatsApp with a Sparo payment link. Client gets it instantly." },
  { day:"Day 3",  icon:"💬", title:"Friendly nudge",     body:"No payment? Varo sends a warm reminder automatically. Zero action needed from you." },
  { day:"Day 7",  icon:"🔔", title:"Follow up",          body:"Varo follows up again, slightly firmer. Still professional, still on your behalf." },
  { day:"Reply",  icon:"🤖", title:"AI handles it",      body:"Client says can I pay half? Varo negotiates, creates a payment plan, sends two links." },
  { day:"Day 14", icon:"⚡", title:"Escalation",         body:"Still unpaid? Varo sends a formal notice and flags it to you for review." },
  { day:"Paid",   icon:"✅", title:"Done",               body:"Payment received. Varo confirms, updates dashboard, exports to your accounting software." },
]
const FEATURES = [
  { icon:"🤖", title:"Large Action Model",       body:"Varo reads client replies, understands intent, and takes the right action — automatically." },
  { icon:"💬", title:"WhatsApp native",          body:"All communication on WhatsApp. That is where your clients actually read messages." },
  { icon:"🧠", title:"Intent detection",         body:"Paying, delaying, disputing — Varo understands and responds appropriately every time." },
  { icon:"📋", title:"Payment plan creator",     body:"Client cannot pay in full? Varo negotiates instalments and tracks each payment." },
  { icon:"🔌", title:"Accounting sync",          body:"Auto-export to Tally, Zoho Books, QuickBooks, Xero, and more when invoice is paid." },
  { icon:"🔗", title:"Powered by Sparo",         body:"Every payment link Varo sends uses Sparo — fees always passed to the client." },
]

export default function VaroLanding() {
  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", fontFamily:"system-ui,sans-serif", overflowX:"hidden" }}>
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:800, height:500, background:"radial-gradient(ellipse,rgba(139,92,246,0.1) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", height:64, background:"rgba(8,12,20,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#fff" }}>K</div>
            <span style={{ fontSize:13, color:"#94A3B8" }}>Klaro Tech</span>
          </Link>
          <span style={{ color:"rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize:15, fontWeight:800, color:"#F1F5F9" }}>Varo</span>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <a href="#how"      style={{ fontSize:14, color:"#94A3B8", textDecoration:"none" }}>How it works</a>
          <a href="#features" style={{ fontSize:14, color:"#94A3B8", textDecoration:"none" }}>Features</a>
          <Link href="/varo/app" style={{ background:COLOR, color:"#fff", fontWeight:700, fontSize:13, padding:"8px 20px", borderRadius:9, textDecoration:"none" }}>Open Varo →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 80px", position:"relative" }}>
        <div style={{ maxWidth:900, position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:100, padding:"5px 16px", fontFamily:"monospace", fontSize:11, letterSpacing:"0.08em", color:"#A78BFA", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:COLOR, borderRadius:"50%", animation:"pulse 2s infinite" }} />
            BY KLARO TECH · AI COLLECTIONS AGENT
          </div>
          <h1 style={{ fontSize:"clamp(40px,7vw,80px)", fontWeight:900, lineHeight:1.03, letterSpacing:"-0.03em", marginBottom:22 }}>
            Stop chasing.<br />Let <span style={{ color:COLOR }}>Varo</span> collect.
          </h1>
          <p style={{ fontSize:18, color:"#94A3B8", maxWidth:540, margin:"0 auto 48px", lineHeight:1.75 }}>
            Varo is your AI collections agent. It sends invoices, chases payments, handles client replies, negotiates payment plans — all on WhatsApp, all automatically.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/varo/app" style={{ background:COLOR, color:"#fff", fontWeight:700, fontSize:15, padding:"14px 36px", borderRadius:10, textDecoration:"none" }}>Start collecting free</Link>
            <a href="#how" style={{ background:"transparent", color:"#F1F5F9", fontSize:15, padding:"14px 28px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", textDecoration:"none" }}>See how it works</a>
          </div>
          <div style={{ marginTop:36, display:"flex", alignItems:"center", justifyContent:"center", gap:24, flexWrap:"wrap", fontSize:13, color:"#94A3B8" }}>
            {["Free to start","WhatsApp native","AI negotiation","Accounting sync"].map(p => (
              <span key={p} style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ color:COLOR }}>✓</span>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ maxWidth:1100, margin:"0 auto", padding:"80px 48px" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:COLOR, marginBottom:10 }}>HOW IT WORKS</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>Send once. Varo does the rest.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:56 }}>You create the invoice. Varo handles sending, chasing, negotiating, and collecting.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {FLOW.map(f => (
            <div key={f.day} style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, borderLeft:"3px solid "+COLOR }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:22 }}>{f.icon}</span>
                <span style={{ fontFamily:"monospace", fontSize:10, color:COLOR, background:"rgba(139,92,246,0.12)", padding:"3px 10px", borderRadius:100 }}>{f.day}</span>
              </div>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth:1100, margin:"0 auto", padding:"40px 48px 80px" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.1em", color:COLOR, marginBottom:10 }}>FEATURES</p>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>Not a reminder tool. An agent.</h2>
        <p style={{ fontSize:16, color:"#94A3B8", maxWidth:480, marginBottom:48 }}>Varo thinks, replies, negotiates and collects. The difference between a to-do list and an employee.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 }}>
              <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ margin:"0 48px 80px", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:22, padding:"56px 48px", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, letterSpacing:"-0.02em", marginBottom:12 }}>
          Stop losing money to<br /><span style={{ color:COLOR }}>unpaid invoices.</span>
        </h2>
        <p style={{ fontSize:15, color:"#94A3B8", marginBottom:32 }}>Free to start. Zero chasing. AI does the work.</p>
        <Link href="/varo/app" style={{ background:COLOR, color:"#fff", fontWeight:700, fontSize:15, padding:"14px 36px", borderRadius:10, textDecoration:"none" }}>Start collecting free →</Link>
      </div>

      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"28px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/" style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>← Klaro Tech</Link>
          <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize:13, color:"#94A3B8" }}>Varo by Klaro — AI Collections</span>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {([["Privacy","/privacy"],["Terms","/terms"],["Cookies","/cookies"],["Contact","mailto:hello@klaro.services"]]).map(([l,href]) => <a key={l} href={href} style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}
