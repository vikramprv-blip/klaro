"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Merchant } from "../../../../../lib/types"

const ACCENT = "#8B5CF6"
const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

export default function NewInvoicePage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [step, setStep]         = useState<1|2|3>(1)
  const [form, setForm] = useState({
    client_name:"", client_whatsapp:"", client_email:"",
    title:"", description:"", amount:"", due_date:"",
    tax_pct:"0", tone:"friendly", auto_chase:true,
    pass_fee:true, fee_pct:"2.5",
  })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    setMerchant(JSON.parse(stored))
  }, [router])

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]:v }))

  const base    = parseFloat(form.amount) || 0
  const tax     = Math.round(base * (parseFloat(form.tax_pct)||0) / 100 * 100) / 100
  const fee     = form.pass_fee ? Math.round(base * (parseFloat(form.fee_pct)||0) / 100 * 100) / 100 : 0
  const total   = Math.round((base + tax + fee) * 100) / 100
  const youGet  = Math.round((base + tax) * 100) / 100

  const TONES = [
    { value:"friendly",     label:"Friendly",     desc:"Warm, casual, emoji-friendly" },
    { value:"professional", label:"Professional", desc:"Polite and business-like" },
    { value:"firm",         label:"Firm",         desc:"Direct and assertive" },
    { value:"formal",       label:"Formal",       desc:"Legal/corporate tone" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", padding:32 }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <Link href="/varo/app" style={{ color:"#94A3B8", fontSize:14 }}>← Varo</Link>
          <h1 style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.02em" }}>New Invoice</h1>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:28 }}>
          {[["1","Client",""],["2","Invoice",""],["3","Chase settings",""]].map(([num, label]) => (
            <div key={num} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:parseInt(num)<=step?ACCENT:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>{num}</div>
              <span style={{ fontSize:13, color:parseInt(num)<=step?"#F1F5F9":"#94A3B8" }}>{label}</span>
              {num !== "3" && <span style={{ color:"rgba(255,255,255,0.2)", margin:"0 4px" }}>→</span>}
            </div>
          ))}
        </div>

        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 }}>

          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <p style={{ fontSize:14, color:"#94A3B8", marginBottom:4 }}>Who are you invoicing?</p>
              <div><label style={lbl}>CLIENT NAME</label><input style={inp} value={form.client_name} onChange={e => update("client_name",e.target.value)} placeholder="e.g. Rahul Sharma" /></div>
              <div><label style={lbl}>WHATSAPP NUMBER</label><input style={inp} value={form.client_whatsapp} onChange={e => update("client_whatsapp",e.target.value)} placeholder="+91 98765 43210" /></div>
              <div><label style={lbl}>EMAIL (optional)</label><input style={inp} type="email" value={form.client_email} onChange={e => update("client_email",e.target.value)} placeholder="rahul@example.com" /></div>
              <button onClick={() => setStep(2)} disabled={!form.client_name || !form.client_whatsapp} style={{ marginTop:8, padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:ACCENT, border:"none", color:"#fff", cursor:"pointer", opacity:!form.client_name||!form.client_whatsapp?0.4:1 }}>
                Next: Invoice details →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <p style={{ fontSize:14, color:"#94A3B8", marginBottom:4 }}>What are you invoicing for?</p>
              <div><label style={lbl}>INVOICE TITLE</label><input style={inp} value={form.title} onChange={e => update("title",e.target.value)} placeholder="e.g. Website Design — Phase 1" /></div>
              <div><label style={lbl}>DESCRIPTION (optional)</label><textarea style={{ ...inp, height:72, resize:"vertical" } as React.CSSProperties} value={form.description} onChange={e => update("description",e.target.value)} placeholder="Details of work done..." /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={lbl}>AMOUNT (₹)</label><input style={inp} type="number" value={form.amount} onChange={e => update("amount",e.target.value)} placeholder="50000" /></div>
                <div><label style={lbl}>DUE DATE</label><input style={inp} type="date" value={form.due_date} onChange={e => update("due_date",e.target.value)} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={lbl}>GST / TAX %</label><input style={inp} type="number" value={form.tax_pct} onChange={e => update("tax_pct",e.target.value)} placeholder="18" /></div>
                <div>
                  <label style={lbl}>PASS CARD FEE TO CLIENT</label>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9 }}>
                    <input type="checkbox" checked={form.pass_fee} onChange={e => update("pass_fee",e.target.checked)} style={{ width:16, height:16 }} />
                    <span style={{ fontSize:13, color:"#94A3B8" }}>Add {form.fee_pct}% to total</span>
                  </div>
                </div>
              </div>

              <div style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:10, padding:16 }}>
                {[["Invoice amount","₹"+base.toLocaleString()],["GST/Tax","₹"+tax.toLocaleString()],form.pass_fee?["Card fee (passed to client)","₹"+fee.toLocaleString()]:null,["Client pays","₹"+total.toLocaleString(),true],["You receive","₹"+youGet.toLocaleString(),false,"#10B981"]].filter(Boolean).map((row: any) => (
                  <div key={row[0]} style={{ display:"flex", justifyContent:"space-between", fontSize:row[2]?15:13, fontWeight:row[2]?700:400, borderTop:row[2]?"1px solid rgba(255,255,255,0.07)":"none", paddingTop:row[2]?8:0, marginTop:row[2]?6:0, marginBottom:row[2]?0:6 }}>
                    <span style={{ color:"#94A3B8" }}>{row[0]}</span>
                    <span style={{ color:row[3]||"#F1F5F9" }}>{row[1]}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStep(1)} style={{ padding:"12px 20px", borderRadius:10, fontSize:14, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer" }}>← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.title||!form.amount||!form.due_date} style={{ flex:1, padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:ACCENT, border:"none", color:"#fff", cursor:"pointer", opacity:!form.title||!form.amount||!form.due_date?0.4:1 }}>
                  Next: Chase settings →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <p style={{ fontSize:14, color:"#94A3B8" }}>How should Varo chase this invoice?</p>

              <div>
                <label style={lbl}>COLLECTION TONE</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {TONES.map(t => (
                    <button key={t.value} onClick={() => update("tone",t.value)} style={{ padding:"12px 16px", borderRadius:10, border:"1px solid "+(form.tone===t.value?ACCENT:"rgba(255,255,255,0.1)"), background:form.tone===t.value?"rgba(139,92,246,0.15)":"transparent", color:form.tone===t.value?"#F1F5F9":"#94A3B8", cursor:"pointer", textAlign:"left" }}>
                      <p style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{t.label}</p>
                      <p style={{ fontSize:12, color:"#94A3B8" }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:16 }}>
                <p style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Auto-chase schedule</p>
                {[["Day 0","Invoice sent via WhatsApp"],["Day 3","Friendly reminder"],["Day 7","Follow-up message"],["Day 14","Firm reminder + payment plan offer"],["Day 21","Formal escalation notice"]].map(([day,action]) => (
                  <div key={day} style={{ display:"flex", gap:12, marginBottom:10, fontSize:13 }}>
                    <span style={{ fontFamily:"monospace", color:ACCENT, minWidth:50 }}>{day}</span>
                    <span style={{ color:"#94A3B8" }}>{action}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:10 }}>
                <input type="checkbox" checked={form.auto_chase} onChange={e => update("auto_chase",e.target.checked)} style={{ width:16, height:16 }} />
                <div>
                  <p style={{ fontSize:14, fontWeight:600 }}>Enable auto-chase</p>
                  <p style={{ fontSize:12, color:"#94A3B8" }}>Varo will automatically send reminders on the schedule above</p>
                </div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStep(2)} style={{ padding:"12px 20px", borderRadius:10, fontSize:14, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer" }}>← Back</button>
                <button
                  onClick={() => alert("Invoice creation + WhatsApp sending coming next — connect your WhatsApp Business API key in Settings first")}
                  style={{ flex:1, padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:ACCENT, border:"none", color:"#fff", cursor:"pointer" }}
                >
                  Create invoice + start collecting →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
