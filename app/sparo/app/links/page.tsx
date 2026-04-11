"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import SparoSidebar from "../../../../components/SparoSidebar"
import { getMerchantLinks } from "../../../lib/actions"
import type { Merchant, PaymentLink } from "../../../lib/types"
import { CURRENCY_SYMBOLS } from "../../../lib/types"

const STATUS_COLOR: Record<string,string> = {
  active:"#6366F1", paid:"#10B981", expired:"#94A3B8", cancelled:"#EF4444"
}

export default function LinksPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [links, setLinks]       = useState<PaymentLink[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState("all")

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    setMerchant(m)
    getMerchantLinks(m.id).then(l => { setLinks(l); setLoading(false) })
  }, [router])

  if (!merchant) return null
  const sym = CURRENCY_SYMBOLS[merchant.currency] ?? "₹"
  const filtered = filter === "all" ? links : links.filter(l => l.status === filter)

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <SparoSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>Payment Links</h1>
            <p style={{ fontSize:14, color:"#94A3B8" }}>{links.length} links total</p>
          </div>
          <Link href="/dashboard/links/new" style={{ background:"#6366F1", color:"#fff", fontWeight:700, fontSize:14, padding:"10px 22px", borderRadius:10, textDecoration:"none" }}>+ New Link</Link>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {["all","active","paid","expired","cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:filter===s?"#6366F1":"transparent", color:filter===s?"#fff":"#94A3B8", cursor:"pointer", fontSize:12, fontFamily:"monospace", letterSpacing:"0.04em" }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                {["Ref","Title","Client","Amount","Fee","Status","Created",""].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontFamily:"monospace", fontSize:10, letterSpacing:"0.06em", color:"#6B7280", fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ padding:"48px 16px", textAlign:"center", color:"#6B7280" }}>Loading...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding:"48px 16px", textAlign:"center" }}>
                    <p style={{ color:"#6B7280", marginBottom:12 }}>No links yet</p>
                    <Link href="/dashboard/links/new" style={{ color:"#6366F1", fontSize:13 }}>Create your first payment link →</Link>
                  </td>
                </tr>
              )}
              {filtered.map((l, i) => (
                <tr key={l.id} style={{ borderTop:i===0?"none":"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:"#6366F1" }}>{l.link_ref}</td>
                  <td style={{ padding:"12px 16px", color:"#F1F5F9", fontWeight:500 }}>{l.title}</td>
                  <td style={{ padding:"12px 16px", color:"#94A3B8" }}>{l.customer_name ?? "—"}</td>
                  <td style={{ padding:"12px 16px", color:"#F1F5F9" }}>{sym}{Number(l.base_amount).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px", color:"#10B981" }}>+{sym}{Number(l.fee_amount).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontFamily:"monospace", fontSize:10, padding:"3px 8px", borderRadius:5, background:STATUS_COLOR[l.status]+"22", color:STATUS_COLOR[l.status] }}>{l.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding:"12px 16px", color:"#6B7280", fontSize:12 }}>{new Date(l.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <button onClick={() => navigator.clipboard.writeText("https://klaro.services/pay/"+l.link_ref)} style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", color:"#6366F1", fontSize:11, padding:"4px 10px", borderRadius:6, cursor:"pointer" }}>Copy link</button>
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
