"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Merchant } from "../../../../../lib/types"

const ACCENT = "#8B5CF6"
const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

const DEFAULT_SCHEDULE = [
  { day:0,  action:"send",     label:"Send invoice",         channel:"whatsapp", enabled:true,  editable:false },
  { day:3,  action:"reminder", label:"Friendly reminder",    channel:"whatsapp", enabled:true,  editable:true  },
  { day:7,  action:"followup", label:"Follow-up",            channel:"whatsapp", enabled:true,  editable:true  },
  { day:14, action:"firm",     label:"Firm reminder",        channel:"whatsapp", enabled:true,  editable:true  },
  { day:21, action:"formal",   label:"Formal notice",        channel:"whatsapp", enabled:false, editable:true  },
]

const TONE_OPTIONS = [
  { value:"friendly",     label:"Friendly",     desc:"Warm, emoji-friendly tone" },
  { value:"professional", label:"Professional", desc:"Polite and business-like" },
  { value:"firm",         label:"Firm",         desc:"Direct and assertive" },
  { value:"formal",       label:"Formal",       desc:"Legal/corporate tone" },
]

const CHANNELS = ["whatsapp","email","sms"]

export default function NewInvoicePage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [step, setStep]         = useState<1|2|3>(1)
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [form, setForm] = useState({
    client_name:"", client_whatsapp:"", client_email:"",
    title:"", description:"", amount:"", due_date:"",
    tax_pct:"0", tone:"friendly", auto_chase:true, pass_fee:true, fee_pct:"2.5",
  })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    setMerchant(JSON.parse(stored))
  }, [router])

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]:v }))

  const updateSchedule = (index: number, key: string, value: any) => {
    setSchedule(s => s.map((item, i) => i === index ? { ...item, [key]: value } : item))
  }

  const base  = parseFloat(form.amount) || 0
  const tax   = Math.round(base * (parseFloat(form.tax_pct)||0) / 100 * 100) / 100
  const fee   = form.pass_fee ? Math.round(base * (parseFloat(form.fee_pct)||0) / 100 * 100) / 100 : 0
  const total = Math.round((base + tax + fee) * 100) / 100
  const sym   = "₹"

  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", padding:32, fontFamily:"system-ui,sans-serif" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <Link href="/varo/app" style={{ color:"#94A3B8", fontSize:14, textDecoration:"none" }}>← Varo</Link>
          <h1 style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.02em" }}>New Invoice</h1>
        </div>

        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
          {[["1","Client"],["2","Invoice"],["3","Chase schedule"]].map(([num, label], i) => (
            <div key={num} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:parseInt(num)<=step?ACCENT:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", cursor:parseInt(num)<step?"pointer":"default" }}
                onClick={() => parseInt(num) < step && setStep(parseInt(num) as 1|2|3)}>
                {parseInt(num) < step ? "✓" : num}
              </div>
              <span style={{ fontSize:13, color:parseInt(num)<=step?"#F1F5F9":"#6B7280" }}>{label}</span>
              {i < 2 && <div style={{ width:40, height:1, background:"rgba(255,255,255,0.1)", margin:"0 4px" }} />}
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
          <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 }}>

            {/* Step 1 — Client */}
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <p style={{ fontSize:14, color:"#94A3B8", marginBottom:4 }}>Who are you invoicing?</p>
                <div><label style={lbl}>CLIENT NAME</label><input style={inp} value={form.client_name} onChange={e => update("client_name",e.target.value)} placeholder="Rahul Sharma" /></div>
                <div><label style={lbl}>WHATSAPP NUMBER</label><input style={inp} value={form.client_whatsapp} onChange={e => update("client_whatsapp",e.target.value)} placeholder="+91 98765 43210" /></div>
                <div><label style={lbl}>EMAIL (optional)</label><input style={inp} type="email" value={form.client_email} onChange={e => update("client_email",e.target.value)} placeholder="rahul@example.com" /></div>
                <button onClick={() => setStep(2)} disabled={!form.client_name || !form.client_whatsapp}
                  style={{ marginTop:8, padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:ACCENT, border:"none", color:"#fff", cursor:"pointer", opacity:!form.client_name||!form.client_whatsapp?0.4:1 }}>
                  Next: Invoice details →
                </button>
              </div>
            )}

            {/* Step 2 — Invoice */}
            {step === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div><label style={lbl}>INVOICE TITLE</label><input style={inp} value={form.title} onChange={e => update("title",e.target.value)} placeholder="Website Design — Phase 1" /></div>
                <div><label style={lbl}>DESCRIPTION (optional)</label><textarea style={{ ...inp, height:72, resize:"vertical" } as React.CSSProperties} value={form.description} onChange={e => update("description",e.target.value)} /></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={lbl}>AMOUNT (₹)</label><input style={inp} type="number" value={form.amount} onChange={e => update("amount",e.target.value)} placeholder="50000" /></div>
                  <div><label style={lbl}>DUE DATE</label><input style={inp} type="date" value={form.due_date} onChange={e => update("due_date",e.target.value)} /></div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={lbl}>GST / TAX %</label><input style={inp} type="number" value={form.tax_pct} onChange={e => update("tax_pct",e.target.value)} placeholder="18" /></div>
                  <div>
                    <label style={lbl}>PASS CARD FEE TO CLIENT</label>
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, cursor:"pointer" }}
                      onClick={() => update("pass_fee", !form.pass_fee)}>
                      <div style={{ width:18, height:18, borderRadius:4, background:form.pass_fee?ACCENT:"transparent", border:"1px solid "+(form.pass_fee?ACCENT:"rgba(255,255,255,0.2)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0 }}>
                        {form.pass_fee ? "✓" : ""}
                      </div>
                      <span style={{ fontSize:13, color:"#94A3B8" }}>Add {form.fee_pct}% card fee</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => setStep(1)} style={{ padding:"12px 20px", borderRadius:10, fontSize:14, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer" }}>← Back</button>
                  <button onClick={() => setStep(3)} disabled={!form.title||!form.amount||!form.due_date}
                    style={{ flex:1, padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:ACCENT, border:"none", color:"#fff", cursor:"pointer", opacity:!form.title||!form.amount||!form.due_date?0.4:1 }}>
                    Next: Chase schedule →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Custom chase schedule */}
            {step === 3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Chase Schedule</p>
                  <p style={{ fontSize:13, color:"#94A3B8", marginBottom:16 }}>Customise exactly when and how Varo follows up. Toggle, adjust days, and choose the channel.</p>

                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {schedule.map((item, i) => (
                      <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid "+(item.enabled?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.06)"), borderRadius:12, padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:item.enabled&&item.editable?12:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:20, height:20, borderRadius:4, background:item.enabled?ACCENT:"transparent", border:"1px solid "+(item.enabled?ACCENT:"rgba(255,255,255,0.2)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0, cursor:item.editable?"pointer":"default" }}
                              onClick={() => item.editable && updateSchedule(i, "enabled", !item.enabled)}>
                              {item.enabled ? "✓" : ""}
                            </div>
                            <div>
                              <p style={{ fontSize:14, fontWeight:600, color:item.enabled?"#F1F5F9":"#6B7280" }}>{item.label}</p>
                              {!item.editable && <p style={{ fontSize:11, color:"#4B5563" }}>Always sent</p>}
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            {item.editable && item.enabled && (
                              <>
                                <span style={{ fontSize:12, color:"#94A3B8" }}>Day</span>
                                <input
                                  type="number" min="1" max="60" value={item.day}
                                  onChange={e => updateSchedule(i, "day", parseInt(e.target.value)||item.day)}
                                  style={{ width:56, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:7, padding:"4px 8px", fontSize:14, color:"#F1F5F9", outline:"none", textAlign:"center", fontFamily:"monospace" }}
                                />
                              </>
                            )}
                            {!item.editable && (
                              <span style={{ fontFamily:"monospace", fontSize:11, color:ACCENT, background:"rgba(139,92,246,0.12)", padding:"3px 10px", borderRadius:100 }}>Day {item.day}</span>
                            )}
                          </div>
                        </div>

                        {item.enabled && item.editable && (
                          <div style={{ display:"flex", gap:8, paddingLeft:32 }}>
                            {CHANNELS.map(ch => (
                              <button key={ch} onClick={() => updateSchedule(i, "channel", ch)}
                                style={{ padding:"5px 12px", borderRadius:7, fontSize:12, border:"1px solid "+(item.channel===ch?ACCENT:"rgba(255,255,255,0.1)"), background:item.channel===ch?"rgba(139,92,246,0.15)":"transparent", color:item.channel===ch?"#C4B5FD":"#6B7280", cursor:"pointer", fontFamily:"monospace" }}>
                                {ch}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={lbl}>COLLECTION TONE</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {TONE_OPTIONS.map(t => (
                      <button key={t.value} onClick={() => update("tone",t.value)}
                        style={{ padding:"11px 14px", borderRadius:10, border:"1px solid "+(form.tone===t.value?ACCENT:"rgba(255,255,255,0.1)"), background:form.tone===t.value?"rgba(139,92,246,0.12)":"transparent", color:form.tone===t.value?"#F1F5F9":"#94A3B8", cursor:"pointer", textAlign:"left" }}>
                        <p style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{t.label}</p>
                        <p style={{ fontSize:11, color:"#94A3B8" }}>{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => setStep(2)} style={{ padding:"12px 20px", borderRadius:10, fontSize:14, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer" }}>← Back</button>
                  <button
                    onClick={() => alert("Invoice created! WhatsApp integration coming next.")}
                    style={{ flex:1, padding:13, borderRadius:10, fontSize:14, fontWeight:700, background:ACCENT, border:"none", color:"#fff", cursor:"pointer" }}>
                    Create invoice + start collecting →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview panel */}
          <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20, height:"fit-content", position:"sticky", top:32 }}>
            <p style={{ fontSize:11, fontFamily:"monospace", color:ACCENT, marginBottom:14 }}>PREVIEW</p>
            <div style={{ background:"#080C14", borderRadius:10, padding:16, marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{form.title||"Invoice title"}</p>
              <p style={{ fontSize:12, color:"#94A3B8" }}>To: {form.client_name||"Client name"}</p>
            </div>
            {[
              ["Amount",           sym+base.toLocaleString()],
              ["GST/Tax",          sym+tax.toLocaleString()],
              ...(form.pass_fee ? [["Card fee (client pays)", sym+fee.toLocaleString()]] : []),
              ["Client pays",      sym+total.toLocaleString(), true],
              ["You receive",      sym+(base+tax).toLocaleString(), false, "#10B981"],
            ].map((row: any) => (
              <div key={row[0]} style={{ display:"flex", justifyContent:"space-between", fontSize:row[2]?14:12, fontWeight:row[2]?700:400, borderTop:row[2]?"1px solid rgba(255,255,255,0.07)":"none", paddingTop:row[2]?8:0, marginTop:row[2]?6:0, marginBottom:row[2]?0:5 }}>
                <span style={{ color:"#94A3B8" }}>{row[0]}</span>
                <span style={{ color:row[3]||"#F1F5F9" }}>{row[1]}</span>
              </div>
            ))}
            <div style={{ marginTop:14, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:"9px 12px" }}>
              <p style={{ fontSize:12, color:"#10B981" }}>You save {sym}{fee.toLocaleString()} on this invoice</p>
            </div>

            {step === 3 && (
              <div style={{ marginTop:14 }}>
                <p style={{ fontSize:11, fontFamily:"monospace", color:ACCENT, marginBottom:10 }}>CHASE PLAN</p>
                {schedule.filter(s => s.enabled).map(s => (
                  <div key={s.action} style={{ display:"flex", gap:8, marginBottom:6, fontSize:12 }}>
                    <span style={{ fontFamily:"monospace", color:ACCENT, minWidth:36 }}>D{s.day}</span>
                    <span style={{ color:"#94A3B8" }}>{s.label} via {s.channel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

