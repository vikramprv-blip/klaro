
import { getPaymentLink } from "../../../lib/actions"
import { CURRENCY_SYMBOLS } from "../../../lib/types"
import { notFound } from "next/navigation"

export default async function PayPage({ params }: { params: { ref: string } }) {
  const link = await getPaymentLink(params.ref) as any
  if (!link) notFound()
  const sym     = CURRENCY_SYMBOLS[link.currency as string] ?? "₹"
  const expired = new Date(link.expires_at) < new Date()
  const paid    = link.status === "paid"
  const merchant = link.merchants
  const name    = merchant?.business_name ?? merchant?.full_name ?? "Merchant"

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420, background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, overflow:"hidden" }}>
        <div style={{ background:"rgba(99,102,241,0.1)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff" }}>K</div>
            <div>
              <p style={{ fontSize:13, fontWeight:600 }}>{name}</p>
              <p style={{ fontSize:11, color:"#94A3B8" }}>via klaro.services</p>
            </div>
          </div>
          <span style={{ fontFamily:"monospace", fontSize:10, color:paid?"#10B981":expired?"#94A3B8":"#6366F1", background:paid?"rgba(16,185,129,0.12)":"rgba(99,102,241,0.12)", padding:"4px 10px", borderRadius:100 }}>
            {paid?"PAID":expired?"EXPIRED":"ACTIVE"}
          </span>
        </div>
        <div style={{ padding:28 }}>
          <h1 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>{link.title}</h1>
          {link.description && <p style={{ fontSize:14, color:"#94A3B8", marginBottom:20 }}>{link.description}</p>}
          <div style={{ background:"#1A2235", borderRadius:12, padding:18, marginBottom:20 }}>
            {[["Invoice amount",sym+Number(link.base_amount).toLocaleString()],["Processing fee",sym+Number(link.fee_amount).toLocaleString()]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#94A3B8", marginBottom:8 }}><span>{k}</span><span>{v}</span></div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:17, fontWeight:800, borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:10, marginTop:4 }}>
              <span>Total due</span>
              <span style={{ color:"#6366F1" }}>{sym}{Number(link.total_amount).toLocaleString()}</span>
            </div>
          </div>
          {paid && <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:10, padding:"14px 18px", textAlign:"center" }}><p style={{ fontSize:15, color:"#10B981", fontWeight:700 }}>Payment completed</p></div>}
          {!paid && !expired && (
            <>
              <p style={{ fontSize:12, fontFamily:"monospace", color:"#6366F1", marginBottom:14 }}>CHOOSE PAYMENT METHOD</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {link.gateways?.includes("upi") && merchant?.upi_id && (
                  <div style={{ background:"#1A2235", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, padding:16 }}>
                    <p style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>📱 UPI — Instant</p>
                    <div style={{ background:"#0A0F1E", borderRadius:8, padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:"monospace", fontSize:13 }}>{merchant.upi_id}</span>
                    </div>
                    <p style={{ fontSize:11, color:"#F59E0B", marginTop:8 }}>Add reference: {link.link_ref}</p>
                  </div>
                )}
                {link.gateways?.includes("razorpay") && (
                  <button style={{ width:"100%", padding:14, borderRadius:11, background:"#6366F1", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    Pay {sym}{Number(link.total_amount).toLocaleString()} — Card / NetBanking
                  </button>
                )}
                {link.gateways?.includes("stripe") && (
                  <button style={{ width:"100%", padding:14, borderRadius:11, background:"transparent", border:"1px solid rgba(255,255,255,0.15)", color:"#F1F5F9", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                    Pay with International Card
                  </button>
                )}
              </div>
              <p style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:16 }}>Secure payment · Expires {new Date(link.expires_at).toLocaleDateString("en-IN")}</p>
            </>
          )}
          {expired && !paid && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"14px 18px", textAlign:"center" }}>
              <p style={{ fontSize:15, color:"#EF4444", fontWeight:700 }}>Link expired</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
