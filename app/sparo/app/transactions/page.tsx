"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SparoSidebar from "../../../../components/SparoSidebar"
import { getMerchantTransactions } from "../../../lib/actions"
import type { Merchant, Transaction } from "../../../lib/types"
import { CURRENCY_SYMBOLS } from "../../../lib/types"

const STATUS_COLOR: Record<string,string> = {
  success:"#10B981", failed:"#EF4444", refunded:"#F59E0B", pending:"#6366F1", disputed:"#F59E0B"
}

export default function TransactionsPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [txns, setTxns]         = useState<Transaction[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    setMerchant(m)
    getMerchantTransactions(m.id).then(t => { setTxns(t); setLoading(false) })
  }, [router])

  if (!merchant) return null
  const sym = CURRENCY_SYMBOLS[merchant.currency] ?? "₹"
  const totalRevenue  = txns.filter(t => t.status==="success").reduce((s,t) => s+Number(t.total_amount),0)
  const totalFeeSaved = txns.filter(t => t.status==="success").reduce((s,t) => s+Number(t.fee_saved),0)

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <SparoSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1 }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>Transactions</h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>{txns.length} payments recorded</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"Total collected", value:sym+totalRevenue.toLocaleString(), color:"#10B981" },
            { label:"Total fees saved", value:sym+totalFeeSaved.toLocaleString(), color:"#6366F1" },
            { label:"Transactions",    value:txns.filter(t=>t.status==="success").length, color:"#F1F5F9" },
          ].map(s => (
            <div key={s.label} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"20px" }}>
              <p style={{ fontSize:12, color:"#94A3B8", marginBottom:6 }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                {["Ref","Client","Gateway","Amount","Fee Saved","Status","Date"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontFamily:"monospace", fontSize:10, letterSpacing:"0.06em", color:"#6B7280", fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding:"48px 16px", textAlign:"center", color:"#6B7280" }}>Loading...</td></tr>}
              {!loading && txns.length === 0 && (
                <tr><td colSpan={7} style={{ padding:"48px 16px", textAlign:"center", color:"#6B7280" }}>No transactions yet. Share a payment link to get started.</td></tr>
              )}
              {txns.map((t, i) => (
                <tr key={t.id} style={{ borderTop:i===0?"none":"1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:"#6366F1" }}>{t.txn_ref}</td>
                  <td style={{ padding:"12px 16px", color:"#F1F5F9" }}>{t.customer_name ?? "Anonymous"}</td>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:"#94A3B8" }}>{t.gateway?.toUpperCase()}</td>
                  <td style={{ padding:"12px 16px", color:"#F1F5F9", fontWeight:600 }}>{sym}{Number(t.total_amount).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px", color:"#10B981" }}>+{sym}{Number(t.fee_saved).toLocaleString()}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontFamily:"monospace", fontSize:10, padding:"3px 8px", borderRadius:5, background:STATUS_COLOR[t.status]+"22", color:STATUS_COLOR[t.status] }}>{t.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding:"12px 16px", color:"#6B7280", fontSize:12 }}>{new Date(t.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
