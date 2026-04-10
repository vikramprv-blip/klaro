
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMerchantStats, getMerchantLinks, getMerchantTransactions } from "../../lib/actions"
import type { Merchant, PaymentLink, Transaction } from "../../lib/types"
import { CURRENCY_SYMBOLS } from "../../lib/types"

const STATUS_COLOR: Record<string,string> = { active:"#6366F1", paid:"#10B981", expired:"#94A3B8", cancelled:"#EF4444" }

const NAV = [
  { href:"/dashboard",              icon:"⚡", label:"Overview" },
  { href:"/dashboard/links",        icon:"🔗", label:"Payment Links" },
  { href:"/dashboard/transactions", icon:"💰", label:"Transactions" },
  { href:"/dashboard/settings",     icon:"⚙️", label:"Settings" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [stats, setStats]       = useState<any>(null)
  const [links, setLinks]       = useState<PaymentLink[]>([])
  const [txns, setTxns]         = useState<Transaction[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    setMerchant(m)
    Promise.all([getMerchantStats(m.id), getMerchantLinks(m.id), getMerchantTransactions(m.id)])
      .then(([s,l,t]) => { setStats(s); setLinks(l.slice(0,5)); setTxns(t.slice(0,5)); setLoading(false) })
  }, [router])

  if (loading || !merchant) return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontFamily:"monospace" }}>Loading...</p>
    </div>
  )

  const sym = CURRENCY_SYMBOLS[merchant.currency] ?? "₹"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:220, background:"#111827", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"24px 16px", display:"flex", flexDirection:"column", gap:4, zIndex:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, paddingLeft:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff" }}>K</div>
          <span style={{ fontSize:16, fontWeight:700 }}>klaro</span>
        </div>
        {NAV.map(n => (
          <Link key={n.href} href={n.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, fontSize:14, color:"#94A3B8", textDecoration:"none" }}>
            <span>{n.icon}</span><span>{n.label}</span>
          </Link>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ padding:"12px", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10 }}>
          <p style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1", marginBottom:4 }}>PLAN: {merchant.plan.toUpperCase()}</p>
          <p style={{ fontSize:12, color:"#94A3B8" }}>{merchant.email}</p>
        </div>
      </aside>

      <main style={{ marginLeft:220, padding:"32px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>Good {greeting}, {merchant.full_name.split(" ")[0]} 👋</h1>
            <p style={{ fontSize:14, color:"#94A3B8" }}>Here is what is happening with your payments</p>
          </div>
          <Link href="/dashboard/links/new" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:14, padding:"10px 22px", borderRadius:10, textDecoration:"none" }}>+ New Link</Link>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Total received",  value:sym+(stats?.totalRevenue??0).toLocaleString(), color:"#10B981" },
            { label:"Fees saved",      value:sym+(stats?.totalFeeSaved??0).toLocaleString(), color:"#6366F1" },
            { label:"Transactions",    value:stats?.totalTxns??0, color:"#F1F5F9" },
            { label:"Active links",    value:stats?.activeLinks??0, color:"#F59E0B" },
          ].map(s => (
            <div key={s.label} style={{ background:"#1A2235", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"20px" }}>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:6 }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:"#1A2235", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:15, fontWeight:700 }}>Recent links</h2>
              <Link href="/dashboard/links" style={{ fontSize:13, color:"#6366F1" }}>View all</Link>
            </div>
            {links.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <p style={{ color:"#94A3B8", fontSize:14, marginBottom:12 }}>No links yet</p>
                <Link href="/dashboard/links/new" style={{ fontSize:13, color:"#6366F1" }}>Create your first link</Link>
              </div>
            ) : links.map(l => (
              <div key={l.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{l.title}</p>
                  <p style={{ fontSize:12, fontFamily:"monospace", color:"#6366F1" }}>{l.link_ref}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:14, fontWeight:700 }}>{sym}{Number(l.total_amount).toLocaleString()}</p>
                  <span style={{ fontSize:10, fontFamily:"monospace", background:STATUS_COLOR[l.status]+"22", color:STATUS_COLOR[l.status], padding:"2px 8px", borderRadius:4 }}>{l.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:"#1A2235", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:15, fontWeight:700 }}>Recent payments</h2>
              <Link href="/dashboard/transactions" style={{ fontSize:13, color:"#6366F1" }}>View all</Link>
            </div>
            {txns.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <p style={{ color:"#94A3B8", fontSize:14 }}>No payments yet</p>
                <p style={{ color:"#94A3B8", fontSize:13, marginTop:4 }}>Share a payment link to get started</p>
              </div>
            ) : txns.map(t => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{t.customer_name??"Anonymous"}</p>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#94A3B8" }}>{t.gateway?.toUpperCase()}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"#10B981" }}>+{sym}{Number(t.total_amount).toLocaleString()}</p>
                  <p style={{ fontSize:11, color:"#94A3B8" }}>saved {sym}{Number(t.fee_saved).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
