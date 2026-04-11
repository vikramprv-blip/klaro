"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import KlaroSidebar from "../../components/KlaroSidebar"
import { getMerchantStats, getMerchantLinks, getMerchantTransactions } from "../../lib/actions"
import type { Merchant, PaymentLink, Transaction } from "../../lib/types"
import { CURRENCY_SYMBOLS } from "../../lib/types"

const STATUS_COLOR: Record<string,string> = {
  active:"#6366F1", paid:"#10B981", expired:"#94A3B8", cancelled:"#EF4444"
}

// Filter tools based on merchant app subscriptions
  const merchantApps = merchant?.apps || ["sparo", "varo"] // default both for existing users
  const ALL_TOOLS = [
  {
    href:"/sparo/app",
    label:"SPARO",
    name:"Smart Payment Links",
    desc:"Create payment links that pass card fees to your client. Keep 100% of what you earn.",
    cta:"Open Sparo →",
    color:"#6366F1",
    bg:"rgba(99,102,241,0.08)",
    border:"rgba(99,102,241,0.2)",
    icon:"⚡",
  },
  {
    href:"/varo/app",
    label:"VARO",
    name:"AI Collections Agent",
    desc:"Send invoices, chase payments, negotiate plans — all automatically on WhatsApp.",
    cta:"Open Varo →",
    color:"#8B5CF6",
    bg:"rgba(139,92,246,0.08)",
    border:"rgba(139,92,246,0.2)",
    icon:"🤖",
  },
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
      <p style={{ color:"#94A3B8", fontFamily:"monospace", fontSize:14 }}>Loading...</p>
    </div>
  )

  const sym     = CURRENCY_SYMBOLS[merchant.currency] ?? "₹"
  const hour    = new Date().getHours()
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <KlaroSidebar merchant={merchant} />
      <main style={{ marginLeft:224, padding:"32px", flex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>
            Good {greeting}, {merchant.full_name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>Welcome to your Klaro dashboard</p>
        </div>

        {/* Tool cards — prominent */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
          {(merchant?.apps?.length ? ALL_TOOLS.filter(t => (merchant.apps||[]).includes(t.id)) : ALL_TOOLS).map(t => (
            <Link key={t.href} href={t.href} style={{ background:t.bg, border:"1px solid "+t.border, borderRadius:16, padding:24, textDecoration:"none", display:"block", transition:"border-color 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:t.color+"22", border:"1px solid "+t.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  {t.icon}
                </div>
                <div>
                  <p style={{ fontSize:10, fontFamily:"monospace", color:t.color, letterSpacing:"0.1em", marginBottom:1 }}>{t.label}</p>
                  <p style={{ fontSize:15, fontWeight:700, color:"#F1F5F9" }}>{t.name}</p>
                </div>
              </div>
              <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.65, marginBottom:14 }}>{t.desc}</p>
              <span style={{ fontSize:13, color:t.color, fontWeight:600 }}>{t.cta}</span>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Total received",  value:sym+(stats?.totalRevenue??0).toLocaleString(),  color:"#10B981" },
            { label:"Fees saved",      value:sym+(stats?.totalFeeSaved??0).toLocaleString(), color:"#6366F1" },
            { label:"Transactions",    value:stats?.totalTxns??0,                            color:"#F1F5F9" },
            { label:"Active links",    value:stats?.activeLinks??0,                          color:"#F59E0B" },
          ].map(s => (
            <div key={s.label} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:16 }}>
              <p style={{ fontSize:11, color:"#94A3B8", marginBottom:4 }}>{s.label}</p>
              <p style={{ fontSize:22, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:22 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontSize:14, fontWeight:700 }}>Recent links</h2>
              <Link href="/dashboard/links" style={{ fontSize:12, color:"#6366F1" }}>View all</Link>
            </div>
            {links.length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <p style={{ color:"#94A3B8", fontSize:13, marginBottom:10 }}>No links yet</p>
                <Link href="/dashboard/links/new" style={{ fontSize:13, color:"#6366F1" }}>Create your first link →</Link>
              </div>
            ) : links.map(l => (
              <div key={l.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:500, marginBottom:1 }}>{l.title}</p>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1" }}>{l.link_ref}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:13, fontWeight:700 }}>{sym}{Number(l.total_amount).toLocaleString()}</p>
                  <span style={{ fontSize:10, fontFamily:"monospace", background:STATUS_COLOR[l.status]+"22", color:STATUS_COLOR[l.status], padding:"2px 7px", borderRadius:4 }}>{l.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:22 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontSize:14, fontWeight:700 }}>Recent payments</h2>
              <Link href="/dashboard/transactions" style={{ fontSize:12, color:"#6366F1" }}>View all</Link>
            </div>
            {txns.length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <p style={{ color:"#94A3B8", fontSize:13 }}>No payments yet</p>
                <p style={{ color:"#94A3B8", fontSize:12, marginTop:4 }}>Share a payment link to get started</p>
              </div>
            ) : txns.map(t => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:500, marginBottom:1 }}>{t.customer_name??"Anonymous"}</p>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#94A3B8" }}>{t.gateway?.toUpperCase()}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#10B981" }}>+{sym}{Number(t.total_amount).toLocaleString()}</p>
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
