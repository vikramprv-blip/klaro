"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import VaroSidebar from "../../../../components/VaroSidebar"
import { supabase } from "../../../../lib/supabase"
import { ALL_CURRENCIES } from "../../../../lib/types"
import type { Merchant } from "../../../../lib/types"

const inp: React.CSSProperties = {
  width:"100%", background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.1)", borderRadius:9,
  padding:"12px 14px", fontSize:14, color:"#F1F5F9",
  outline:"none", boxSizing:"border-box"
}
const lbl: React.CSSProperties = {
  display:"block", fontSize:11, fontFamily:"monospace",
  letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6
}

const TONES = [
  { value:"friendly",     label:"Friendly",     desc:"Warm, emoji-friendly" },
  { value:"professional", label:"Professional", desc:"Polite & business-like" },
  { value:"firm",         label:"Firm",         desc:"Direct & assertive" },
  { value:"formal",       label:"Formal",       desc:"Legal/corporate" },
]

const ACCOUNTING = [
  { value:"",            label:"None" },
  { value:"tally",       label:"Tally Prime (India)" },
  { value:"zoho",        label:"Zoho Books" },
  { value:"quickbooks",  label:"QuickBooks" },
  { value:"xero",        label:"Xero" },
  { value:"freshbooks",  label:"FreshBooks" },
  { value:"custom",      label:"Custom Webhook" },
]

export default function VaroSettingsPage() {
  const router = useRouter()
  const [merchant, setMerchant]         = useState<Merchant|null>(null)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [error, setError]               = useState<string|null>(null)
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(["INR","USD"])
  const [form, setForm] = useState({
    whatsapp_number:   "",
    whatsapp_api_key:  "",
    whatsapp_phone_id: "",
    default_tone:      "friendly",
    auto_chase:        true,
    accounting_platform: "",
    default_currency:  "INR",
    invoice_prefix:    "INV",
  })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    if (m.apps && !m.apps.includes("varo")) { router.push("/varo"); return }
    setMerchant(m)

    supabase.from("varo_settings").select("*")
      .eq("merchant_id", m.id).maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError("Failed to load settings: " + err.message)
        if (data) {
          setForm({
            whatsapp_number:    data.whatsapp_number   || "",
            whatsapp_api_key:   data.whatsapp_api_key  || "",
            whatsapp_phone_id:  data.whatsapp_phone_id || "",
            default_tone:       data.default_tone      || "friendly",
            auto_chase:         data.auto_chase        ?? true,
            accounting_platform:data.accounting_platform || "",
            default_currency:   data.default_currency  || "INR",
            invoice_prefix:     data.invoice_prefix    || "INV",
          })
          if (data.supported_currencies) setSelectedCurrencies(data.supported_currencies)
        }
        setLoading(false)
      })
  }, [router])

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleCurrency = (code: string) => {
    setSelectedCurrencies(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const handleSave = async () => {
    if (!merchant) return
    setSaving(true); setError(null)
    const { error: err } = await supabase.from("varo_settings").upsert({
      merchant_id:          merchant.id,
      whatsapp_number:      form.whatsapp_number      || null,
      whatsapp_api_key:     form.whatsapp_api_key     || null,
      whatsapp_phone_id:    form.whatsapp_phone_id    || null,
      default_tone:         form.default_tone,
      auto_chase:           form.auto_chase,
      accounting_platform:  form.accounting_platform  || null,
      default_currency:     form.default_currency,
      supported_currencies: selectedCurrencies,
      invoice_prefix:       form.invoice_prefix       || "INV",
    }, { onConflict: "merchant_id" })

    setSaving(false)
    if (err) { setError("Failed to save: " + err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080C14", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontFamily:"monospace" }}>Loading...</p>
    </div>
  )
  if (!merchant) return null

  const POPULAR = ["INR","USD","EUR","GBP","AED","SGD","MYR","PHP","IDR","THB"]
  const OTHER   = ALL_CURRENCIES.filter(c => !POPULAR.includes(c.code))
  const popular = ALL_CURRENCIES.filter(c => POPULAR.includes(c.code))

  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", display:"flex" }}>
      <VaroSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1, maxWidth:720 }}>

        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontFamily:"monospace", color:"#8B5CF6", letterSpacing:"0.08em", marginBottom:4 }}>VARO · SETTINGS</p>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>Varo Settings</h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>Configure your AI collections preferences</p>
        </div>

        {error && (
          <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"12px 16px", marginBottom:20 }}>
            <p style={{ color:"#FCA5A5", fontSize:13 }}>{error}</p>
          </div>
        )}

        {/* WhatsApp */}
        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>WhatsApp Business API</h2>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:18 }}>Connect your WhatsApp Business account to send automated messages.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><label style={lbl}>WHATSAPP NUMBER</label><input style={inp} value={form.whatsapp_number} onChange={e => update("whatsapp_number",e.target.value)} placeholder="+91 98765 43210" /></div>
            <div><label style={lbl}>API ACCESS TOKEN</label><input style={inp} type="password" value={form.whatsapp_api_key} onChange={e => update("whatsapp_api_key",e.target.value)} placeholder="EAAxxxx..." /></div>
            <div><label style={lbl}>PHONE NUMBER ID</label><input style={inp} value={form.whatsapp_phone_id} onChange={e => update("whatsapp_phone_id",e.target.value)} placeholder="1234567890" /></div>
          </div>
        </div>

        {/* Currencies */}
        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Currencies</h2>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:18 }}>Select all currencies you invoice in. Your clients will pay in their local currency.</p>

          <div style={{ marginBottom:16 }}>
            <label style={lbl}>DEFAULT CURRENCY</label>
            <select style={{ ...inp, background:"#0D1117" }} value={form.default_currency} onChange={e => update("default_currency",e.target.value)}>
              {ALL_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <label style={lbl}>SUPPORTED CURRENCIES</label>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:12 }}>Popular markets</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {popular.map(c => {
              const sel = selectedCurrencies.includes(c.code)
              return (
                <button key={c.code} onClick={() => toggleCurrency(c.code)}
                  style={{ padding:"6px 12px", borderRadius:8, border:"1px solid "+(sel?"#8B5CF6":"rgba(255,255,255,0.1)"), background:sel?"rgba(139,92,246,0.15)":"transparent", color:sel?"#C4B5FD":"#94A3B8", cursor:"pointer", fontSize:13, fontFamily:"monospace" }}>
                  {c.symbol} {c.code}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:12 }}>Other currencies</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {OTHER.map(c => {
              const sel = selectedCurrencies.includes(c.code)
              return (
                <button key={c.code} onClick={() => toggleCurrency(c.code)}
                  style={{ padding:"6px 12px", borderRadius:8, border:"1px solid "+(sel?"#8B5CF6":"rgba(255,255,255,0.08)"), background:sel?"rgba(139,92,246,0.15)":"transparent", color:sel?"#C4B5FD":"#6B7280", cursor:"pointer", fontSize:12, fontFamily:"monospace" }}>
                  {c.symbol} {c.code}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize:11, color:"#4B5563", marginTop:10 }}>{selectedCurrencies.length} currencies selected: {selectedCurrencies.join(", ")}</p>
        </div>

        {/* Invoice */}
        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Invoice settings</h2>
          <div><label style={lbl}>INVOICE PREFIX</label><input style={inp} value={form.invoice_prefix} onChange={e => update("invoice_prefix",e.target.value)} placeholder="INV" /></div>
          <p style={{ fontSize:12, color:"#94A3B8", marginTop:6 }}>Example: {form.invoice_prefix || "INV"}-00001</p>
        </div>

        {/* Collection defaults */}
        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Collection defaults</h2>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>DEFAULT TONE</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {TONES.map(t => (
                <button key={t.value} onClick={() => update("default_tone",t.value)}
                  style={{ padding:"12px 16px", borderRadius:10, border:"1px solid "+(form.default_tone===t.value?"#8B5CF6":"rgba(255,255,255,0.1)"), background:form.default_tone===t.value?"rgba(139,92,246,0.12)":"transparent", color:form.default_tone===t.value?"#F1F5F9":"#94A3B8", cursor:"pointer", textAlign:"left" }}>
                  <p style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{t.label}</p>
                  <p style={{ fontSize:12, color:"#94A3B8" }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, cursor:"pointer" }}
            onClick={() => update("auto_chase",!form.auto_chase)}>
            <div>
              <p style={{ fontSize:14, fontWeight:600 }}>Auto-chase enabled</p>
              <p style={{ fontSize:12, color:"#94A3B8" }}>Automatically send reminders on schedule</p>
            </div>
            <div style={{ width:44, height:24, borderRadius:12, background:form.auto_chase?"#8B5CF6":"rgba(255,255,255,0.1)", position:"relative", transition:"background 0.2s" }}>
              <div style={{ position:"absolute", top:2, left:form.auto_chase?20:2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
            </div>
          </div>
        </div>

        {/* Accounting */}
        <div style={{ background:"#0F1520", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:24 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Accounting integration</h2>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:14 }}>Auto-export paid invoices to your accounting software.</p>
          <label style={lbl}>DEFAULT PLATFORM</label>
          <select style={{ ...inp, background:"#0D1117" }} value={form.accounting_platform} onChange={e => update("accounting_platform",e.target.value)}>
            {ACCOUNTING.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          {form.accounting_platform && (
            <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:8 }}>
              <p style={{ fontSize:13, color:"#C4B5FD" }}>Configure API keys in <a href="/varo/app/integrations" style={{ color:"#8B5CF6" }}>Integrations →</a></p>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ padding:"12px 32px", borderRadius:10, fontSize:15, fontWeight:700, background:saved?"#10B981":saving?"#4B5563":"#8B5CF6", border:"none", color:"#fff", cursor:"pointer", opacity:saving?0.7:1 }}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save settings"}
        </button>
      </main>
    </div>
  )
}
