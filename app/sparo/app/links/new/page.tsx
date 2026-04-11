
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createPaymentLink } from "../../../../lib/actions"
import type { Merchant } from "../../../../lib/types"
import { CURRENCY_SYMBOLS } from "../../../../lib/types"

const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

export default function NewLinkPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string|null>(null)
  const [form, setForm] = useState({ title:"", description:"", base_amount:"", fee_pct:"2.5", fee_flat:"0", customer_name:"", customer_email:"", customer_phone:"", customer_whatsapp:"", gateways:["upi","razorpay"] })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    setMerchant(JSON.parse(stored))
  }, [router])

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]:v }))
  const toggleGateway = (g: string) => setForm(f => ({ ...f, gateways: f.gateways.includes(g) ? f.gateways.filter(x => x!==g) : [...f.gateways,g] }))

  const base    = parseFloat(form.base_amount) || 0
  const feePct  = parseFloat(form.fee_pct) || 0
  const feeAmt  = Math.round(base * feePct / 100 * 100) / 100
  const total   = Math.round((base + feeAmt) * 100) / 100
  const sym     = merchant ? CURRENCY_SYMBOLS[merchant.currency] ?? "₹" : "₹"

  const handleSubmit = async () => {
    if (!merchant) return
    setLoading(true); setError(null)
    const { link, error } = await createPaymentLink({
      merchant_id:merchant.id, title:form.title, description:form.description||undefined,
      base_amount:base, fee_pct:feePct, currency:merchant.currency, gateways:form.gateways,
      customer_name:form.customer_name||undefined, customer_email:form.customer_email||undefined,
      customer_phone:form.customer_phone||undefined, customer_whatsapp:form.customer_whatsapp||undefined,
    })
    setLoading(false)
    if (error || !link) { setError(error ?? "Something went wrong."); return }
    router.push("/dashboard/links?created="+link.link_ref)
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", padding:32 }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <Link href="/dashboard" style={{ color:"#94A3B8", fontSize:14 }}>← Back</Link>
          <h1 style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.02em" }}>New payment link</h1>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20 }}>
          <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div><label style={lbl}>LINK TITLE</label><input style={inp} value={form.title} onChange={e => update("title",e.target.value)} placeholder="e.g. Website design Phase 1" /></div>
              <div><label style={lbl}>DESCRIPTION</label><textarea style={{ ...inp, height:72, resize:"vertical" } as React.CSSProperties} value={form.description} onChange={e => update("description",e.target.value)} placeholder="Details your client will see" /></div>
              <div><label style={lbl}>INVOICE AMOUNT ({merchant?.currency??"INR"})</label><input style={inp} type="number" value={form.base_amount} onChange={e => update("base_amount",e.target.value)} placeholder="50000" /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={lbl}>CARD FEE % TO PASS ON</label><input style={inp} type="number" step="0.1" value={form.fee_pct} onChange={e => update("fee_pct",e.target.value)} /></div>
                <div><label style={lbl}>FLAT FEE TO ADD</label><input style={inp} type="number" value={form.fee_flat} onChange={e => update("fee_flat",e.target.value)} placeholder="0" /></div>
              </div>
              <div>
                <label style={lbl}>PAYMENT METHODS</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["upi","razorpay","stripe","bank_transfer"].map(g => (
                    <button key={g} onClick={() => toggleGateway(g)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid "+(form.gateways.includes(g)?"#6366F1":"rgba(255,255,255,0.1)"), background:form.gateways.includes(g)?"rgba(99,102,241,0.15)":"transparent", color:form.gateways.includes(g)?"#818CF8":"#94A3B8", fontSize:13, cursor:"pointer", fontFamily:"monospace" }}>
                      {g.replace("_"," ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.07)" }} />
              <p style={{ fontSize:12, fontFamily:"monospace", color:"#6366F1" }}>CLIENT DETAILS (optional)</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={lbl}>CLIENT NAME</label><input style={inp} value={form.customer_name} onChange={e => update("customer_name",e.target.value)} placeholder="Rahul Sharma" /></div>
                <div><label style={lbl}>CLIENT EMAIL</label><input style={inp} type="email" value={form.customer_email} onChange={e => update("customer_email",e.target.value)} placeholder="rahul@example.com" /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={lbl}>PHONE</label><input style={inp} value={form.customer_phone} onChange={e => update("customer_phone",e.target.value)} placeholder="+91 98765 43210" /></div>
                <div><label style={lbl}>WHATSAPP</label><input style={inp} value={form.customer_whatsapp} onChange={e => update("customer_whatsapp",e.target.value)} placeholder="+91 98765 43210" /></div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, position:"sticky", top:32 }}>
              <p style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1", marginBottom:16 }}>PREVIEW</p>
              <div style={{ background:"#1A2235", borderRadius:12, padding:18, marginBottom:16 }}>
                <p style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{form.title||"Link title"}</p>
                <p style={{ fontSize:12, color:"#94A3B8" }}>{form.description||"Description appears here"}</p>
              </div>
              {[["Invoice amount",sym+base.toLocaleString(),false,undefined],["Processing fee ("+feePct+"%)",sym+feeAmt.toLocaleString(),false,undefined],["Client pays",sym+total.toLocaleString(),true,undefined],["You receive",sym+base.toLocaleString(),false,"#10B981"]].map(([label,value,bold,color]) => (
                <div key={String(label)} style={{ display:"flex", justifyContent:"space-between", fontSize:bold?15:13, fontWeight:bold?700:400, borderTop:bold?"1px solid rgba(255,255,255,0.07)":"none", paddingTop:bold?8:0, marginTop:bold?4:0, marginBottom:bold?0:6 }}>
                  <span style={{ color:"#94A3B8" }}>{label}</span>
                  <span style={{ color:color?String(color):"#F1F5F9" }}>{value}</span>
                </div>
              ))}
              <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:9, padding:"10px 14px", margin:"16px 0" }}>
                <p style={{ fontSize:12, color:"#10B981" }}>You save {sym}{feeAmt.toLocaleString()} on this invoice</p>
              </div>
              {error && <p style={{ color:"#EF4444", fontSize:13, marginBottom:12 }}>{error}</p>}
              <button onClick={handleSubmit} disabled={loading||!form.title||!form.base_amount} style={{ width:"100%", padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading?0.6:1 }}>
                {loading?"Creating...":"Create payment link →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
