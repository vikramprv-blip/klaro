"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import VaroSidebar from "../../../../components/VaroSidebar"
import { supabase } from "../../../../lib/supabase"
import type { Merchant } from "../../../../lib/types"

const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

const TONES = ["friendly","professional","firm","formal"]

export default function VaroSettingsPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [saved, setSaved]       = useState(false)
  const [form, setForm] = useState({
    whatsapp_number:"", whatsapp_api_key:"", whatsapp_phone_id:"",
    default_tone:"friendly", auto_chase:true, accounting_platform:""
  })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    if (!m.apps?.includes("varo")) { router.push("/auth"); return }
    setMerchant(m)
    supabase.from("varo_settings").select("*").eq("merchant_id", m.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          whatsapp_number:  data.whatsapp_number || "",
          whatsapp_api_key: data.whatsapp_api_key || "",
          whatsapp_phone_id:data.whatsapp_phone_id || "",
          default_tone:     data.default_tone || "friendly",
          auto_chase:       data.auto_chase ?? true,
          accounting_platform: data.accounting_platform || "",
        })
      })
  }, [router])

  const handleSave = async () => {
    if (!merchant) return
    await supabase.from("varo_settings").upsert({
      merchant_id:       merchant.id,
      whatsapp_number:   form.whatsapp_number || null,
      whatsapp_api_key:  form.whatsapp_api_key || null,
      whatsapp_phone_id: form.whatsapp_phone_id || null,
      default_tone:      form.default_tone,
      auto_chase:        form.auto_chase,
      accounting_platform: form.accounting_platform || null,
    }, { onConflict: "merchant_id" })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!merchant) return null

  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", display:"flex" }}>
      <VaroSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1, maxWidth:680 }}>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4, letterSpacing:"-0.02em" }}>Varo Settings</h1>
        <p style={{ fontSize:14, color:"#94A3B8", marginBottom:28 }}>Configure your collections preferences</p>

        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>WhatsApp Business API</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><label style={lbl}>WHATSAPP NUMBER</label><input style={inp} value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number:e.target.value }))} placeholder="+91 98765 43210" /></div>
            <div><label style={lbl}>API KEY</label><input style={inp} type="password" value={form.whatsapp_api_key} onChange={e => setForm(f => ({ ...f, whatsapp_api_key:e.target.value }))} placeholder="EAAxxxx..." /></div>
            <div><label style={lbl}>PHONE NUMBER ID</label><input style={inp} value={form.whatsapp_phone_id} onChange={e => setForm(f => ({ ...f, whatsapp_phone_id:e.target.value }))} placeholder="1234567890" /></div>
          </div>
        </div>

        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Collection defaults</h2>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>DEFAULT TONE</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {TONES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, default_tone:t }))}
                  style={{ padding:"9px", borderRadius:8, border:"1px solid "+(form.default_tone===t?"#8B5CF6":"rgba(255,255,255,0.1)"), background:form.default_tone===t?"rgba(139,92,246,0.15)":"transparent", color:form.default_tone===t?"#F1F5F9":"#94A3B8", cursor:"pointer", fontSize:12, fontWeight:form.default_tone===t?600:400, textTransform:"capitalize" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:9, cursor:"pointer" }}
            onClick={() => setForm(f => ({ ...f, auto_chase:!f.auto_chase }))}>
            <div>
              <p style={{ fontSize:14, fontWeight:600 }}>Auto-chase enabled</p>
              <p style={{ fontSize:12, color:"#94A3B8" }}>Automatically send reminders on schedule</p>
            </div>
            <div style={{ width:44, height:24, borderRadius:12, background:form.auto_chase?"#8B5CF6":"rgba(255,255,255,0.1)", position:"relative", transition:"background 0.2s" }}>
              <div style={{ position:"absolute", top:2, left:form.auto_chase?20:2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} style={{ padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700, background:saved?"#10B981":"#8B5CF6", border:"none", color:"#fff", cursor:"pointer" }}>
          {saved ? "Saved ✓" : "Save settings"}
        </button>
      </main>
    </div>
  )
}
