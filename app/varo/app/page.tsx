"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Merchant } from "../../../lib/types"

const ACCENT = "#8B5CF6"

const NAV = [
  { href:"/varo/app",            icon:"⚡", label:"Overview" },
  { href:"/varo/app/invoices",   icon:"📄", label:"Invoices" },
  { href:"/varo/app/clients",    icon:"👥", label:"Clients" },
  { href:"/varo/app/collections",icon:"🤖", label:"Collections" },
  { href:"/sparo",               icon:"🔗", label:"Sparo Links" },
  { href:"/dashboard",           icon:"⚙️", label:"Settings" },
]

export default function VaroAppPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    setMerchant(JSON.parse(stored))
    setLoading(false)
  }, [router])

  if (loading || !merchant) return (
    <div style={{ minHeight:"100vh", background:"#080C14", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontFamily:"monospace" }}>Loading Varo...</p>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", display:"flex" }}>
      <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:220, background:"#0F1520", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"24px 16px", display:"flex", flexDirection:"column", gap:4, zIndex:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, paddingLeft:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff" }}>V</div>
          <div>
            <span style={{ fontSize:15, fontWeight:800 }}>Varo</span>
            <span style={{ fontSize:10, color:"#94A3B8", display:"block", fontFamily:"monospace" }}>by Klaro</span>
          </div>
        </div>
        <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.06)", margin:"8px 0 12px" }} />
        {NAV.map(n => (
          <Link key={n.href} href={n.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, fontSize:14, color:"#94A3B8", textDecoration:"none" }}>
            <span>{n.icon}</span><span>{n.label}</span>
          </Link>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ padding:"12px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:10 }}>
          <p style={{ fontSize:11, fontFamily:"monospace", color:ACCENT, marginBottom:4 }}>PLAN: {merchant.plan.toUpperCase()}</p>
          <p style={{ fontSize:12, color:"#94A3B8" }}>{merchant.email}</p>
        </div>
      </aside>

      <main style={{ marginLeft:220, padding:"32px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>Collections Overview</h1>
            <p style={{ fontSize:14, color:"#94A3B8" }}>Your AI agent is watching your receivables</p>
          </div>
          <Link href="/varo/app/invoices/new" style={{ background:ACCENT, color:"#fff", fontWeight:700, fontSize:14, padding:"10px 22px", borderRadius:10, textDecoration:"none" }}>
            + New Invoice
          </Link>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Total outstanding", value:"₹0",     color:ACCENT },
            { label:"Invoices overdue",  value:"0",      color:"#EF4444" },
            { label:"Active collections",value:"0",      color:"#F59E0B" },
            { label:"Collected this month",value:"₹0",  color:"#10B981" },
          ].map(s => (
            <div key={s.label} style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"20px" }}>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:6 }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:32, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
          <h2 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Varo is ready to collect</h2>
          <p style={{ fontSize:15, color:"#94A3B8", maxWidth:400, margin:"0 auto 24px", lineHeight:1.7 }}>
            Create your first invoice and Varo will automatically send it, chase it, and collect it — all on WhatsApp.
          </p>
          <Link href="/varo/app/invoices/new" style={{ background:ACCENT, color:"#fff", fontWeight:700, fontSize:14, padding:"12px 28px", borderRadius:10, textDecoration:"none", display:"inline-block" }}>
            Create first invoice →
          </Link>
        </div>
      </main>
    </div>
  )
}
