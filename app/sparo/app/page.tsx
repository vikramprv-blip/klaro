"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import SparoSidebar from "../../../components/SparoSidebar"
import { getMerchantStats, getMerchantLinks } from "../../../lib/actions"
import type { Merchant, PaymentLink } from "../../../lib/types"
import { CURRENCY_SYMBOLS } from "../../../lib/types"

const STATUS_COLOR: Record<string,string> = {
  active:"#6366F1", paid:"#10B981", expired:"#94A3B8", cancelled:"#EF4444"
}

export default function SparoAppPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [stats, setStats]       = useState<any>(null)
  const [links, setLinks]       = useState<PaymentLink[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    if (m.apps && !m.apps.includes('sparo')) { router.push('/auth'); return }
    setMerchant(m)
    Promise.all([getMerchantStats(m.id), getMerchantLinks(m.id)])
      .then(([s, l]) => { setStats(s); setLinks(l); setLoading(false) })
  }, [router])

  if (!merchant) return null
  const sym = CURRENCY_SYMBOLS[merchant.currency] ?? "₹"

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <SparoSidebar merchant={merchant} />
      <main style={{ marginLeft:224, padding:"32px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <p style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1", letterSpacing:"0.08em", marginBottom:4 }}>SPARO</p>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>Payment Links</h1>
            <p style={{ fontSize:14, color:"#94A3B8" }}>Create links that pass card fees to your client</p>
          </div>
          <Link href="/dashboard/links/new" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:14, padding:"10px 22px", borderRadius:10, textDecoration:"none" }}>+ New Link</Link>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Total collected",  value:sym+(stats?.totalRevenue??0).toLocaleString(),  color:"#10B981" },
            { label:"Fees saved",       value:sym+(stats?.totalFeeSaved??0).toLocaleString(), color:"#6366F1" },
            { label:"Active links",     value:stats?.activeLinks??0,                          color:"#F59E0B" },
            { label:"Paid links",       value:stats?.paidLinks??0,                            color:"#10B981" },
          ].map(s => (
            <div key={s.label} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:20 }}>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:6 }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>All payment links</h2>
            <span style={{ fontSize:12, color:"#94A3B8" }}>{links.length} total</span>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                {["Ref","Title","Client","Base","Fee","Total","Status",""].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"monospace", fontSize:10, letterSpacing:"0.06em", color:"#6B7280", fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ padding:"48px 16px", textAlign:"center", color:"#6B7280" }}>Loading...</td></tr>}
              {!loading && links.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding:"48px 16px", textAlign:"center" }}>
                    <p style={{ color:"#6B7280", marginBottom:12 }}>No payment links yet</p>
                    <Link href="/dashboard/links/new" style={{ color:"#6366F1", fontSize:13 }}>Create your first payment link →</Link>
                  </td>
                </tr>
              )}
              {links.map((l, i) => (
                <tr key={l.id} style={{ borderTop:i===0?"none":"1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:"#6366F1" }}>{l.link_ref}</td>
                  <td style={{ padding:"12px 16px", color:"#F1F5F9", fontWeight:500, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</td>
                  <td style={{ padding:"12px 16px", color:"#94A3B8" }}>{l.customer_name ?? "—"}</td>
                  <td style={{ padding:"12px 16px", color:"#94A3B8" }}>{sym}{Number(l.base_amount).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px", color:"#10B981" }}>+{sym}{Number(l.fee_amount).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px", color:"#F1F5F9", fontWeight:600 }}>{sym}{Number(l.total_amount).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontFamily:"monospace", fontSize:10, padding:"3px 8px", borderRadius:5, background:STATUS_COLOR[l.status]+"22", color:STATUS_COLOR[l.status] }}>{l.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("https://klaro.services/pay/"+l.link_ref)
                      }}
                      style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#6366F1", fontSize:11, padding:"4px 10px", borderRadius:6, cursor:"pointer" }}>
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
