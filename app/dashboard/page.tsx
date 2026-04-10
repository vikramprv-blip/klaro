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

  const sym  = CURRENCY_SYMBOLS[merchant.currency] ?? "₹"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <KlaroSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1 }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>
              Good {greeting}, {merchant.full_name.split(" ")[0]} 👋
            </h1>
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
                <Link href="/dashboard/links/new" style={{ fontSize:13, color:"#6366F1" }}>Create your first link →</Link>
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

        <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Link href="/varo/app" style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(139,92,246,0.05))", border:"1px solid rgba(139,92,246,0.25)", borderRadius:14, padding:20, textDecoration:"none", display:"block" }}>
            <p style={{ fontSize:13, fontFamily:"monospace", color:"#8B5CF6", marginBottom:6 }}>VARO</p>
            <p style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", marginBottom:4 }}>AI Collections Agent</p>
            <p style={{ fontSize:13, color:"#94A3B8" }}>Chase invoices automatically on WhatsApp →</p>
          </Link>
          <Link href="/dashboard/links/new" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))", border:"1px solid rgba(99,102,241,0.25)", borderRadius:14, padding:20, textDecoration:"none", display:"block" }}>
            <p style={{ fontSize:13, fontFamily:"monospace", color:"#6366F1", marginBottom:6 }}>SPARO</p>
            <p style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", marginBottom:4 }}>New Payment Link</p>
            <p style={{ fontSize:13, color:"#94A3B8" }}>Create a link and pass the fee to your client →</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
