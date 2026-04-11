"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SparoSidebar from "../../../../components/SparoSidebar"
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

export default function SparoSettingsPage() {
  const router = useRouter()
  const [merchant, setMerchant]   = useState<Merchant|null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string|null>(null)
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(["INR","USD"])
  const [form, setForm] = useState({
    upi_id:           "",
    default_fee_pct:  "2.5",
    razorpay_key_id:  "",
    stripe_pub_key:   "",
    branding_name:    "",
    default_currency: "INR",
  })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    if (m.apps && !m.apps.includes("sparo")) { router.push("/sparo"); return }
    setMerchant(m)
    supabase.from("sparo_settings").select("*").eq("merchant_id", m.id).maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError("Failed to load: " + err.message)
        if (data) {
          setForm({
            upi_id:           data.upi_id            || "",
            default_fee_pct:  String(data.default_fee_pct || 2.5),
            razorpay_key_id:  data.razorpay_key_id   || "",
            stripe_pub_key:   data.stripe_pub_key    || "",
            branding_name:    data.branding_name     || "",
            default_currency: data.default_currency  || "INR",
          })
          if (data.supported_currencies) setSelectedCurrencies(data.supported_currencies)
        }
        setLoading(false)
      })
  }, [router])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleCurrency = (code: string) => {
    setSelectedCurrencies(prev => prev.includes(code) ? prev.filter(c=>c!==code) : [...prev,code])
  }

  const handleSave = async () => {
    if (!merchant) return
    setSaving(true); setError(null)
    const { error: err } = await supabase.from("sparo_settings").upsert({
      merchant_id:          merchant.id,
      upi_id:               form.upi_id           || null,
      default_fee_pct:      parseFloat(form.default_fee_pct) || 2.5,
      razorpay_key_id:      form.razorpay_key_id  || null,
      stripe_pub_key:       form.stripe_pub_key   || null,
      branding_name:        form.branding_name    || null,
      default_currency:     form.default_currency,
      supported_currencies: selectedCurrencies,
    }, { onConflict: "merchant_id" })
    setSaving(false)
    if (err) { setError("Failed to save: " + err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontFamily:"monospace" }}>Loading...</p>
    </div>
  )
  if (!merchant) return null

  const POPULAR = ["INR","USD","EUR","GBP","AED","SGD","MYR","PHP","IDR","THB"]
  const popular = ALL_CURRENCIES.filter(c => POPULAR.includes(c.code))
  const other   = ALL_CURRENCIES.filter(c => !POPULAR.includes(c.code))

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <SparoSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1, maxWidth:720 }}>

        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1", letterSpacing:"0.08em", marginBottom:4 }}>SPARO · SETTINGS</p>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>Sparo Settings</h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>Configure your payment link preferences</p>
        </div>

        {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"12px 16px", marginBottom:20 }}><p style={{ color:"#FCA5A5", fontSize:13 }}>{error}</p></div>}

        {/* Payment details */}
        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Payment details</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><label style={lbl}>YOUR UPI ID</label><input style={inp} value={form.upi_id} onChange={e => update("upi_id",e.target.value)} placeholder="name@okicici" /></div>
            <div><label style={lbl}>DEFAULT FEE % TO PASS ON</label><input style={inp} type="number" step="0.1" value={form.default_fee_pct} onChange={e => update("default_fee_pct",e.target.value)} placeholder="2.5" /></div>
            <div><label style={lbl}>BUSINESS NAME ON LINKS</label><input style={inp} value={form.branding_name} onChange={e => update("branding_name",e.target.value)} placeholder="Your Business Name" /></div>
          </div>
        </div>

        {/* Currencies */}
        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Currencies</h2>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:18 }}>Select currencies you accept from clients.</p>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>DEFAULT CURRENCY</label>
            <select style={{ ...inp, background:"#111827" }} value={form.default_currency} onChange={e => update("default_currency",e.target.value)}>
              {ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
            </select>
          </div>
          <label style={lbl}>ACCEPTED CURRENCIES</label>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:10 }}>Popular</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
            {popular.map(c => {
              const sel = selectedCurrencies.includes(c.code)
              return (
                <button key={c.code} onClick={() => toggleCurrency(c.code)}
                  style={{ padding:"6px 12px", borderRadius:8, border:"1px solid "+(sel?"#6366F1":"rgba(255,255,255,0.1)"), background:sel?"rgba(99,102,241,0.15)":"transparent", color:sel?"#818CF8":"#94A3B8", cursor:"pointer", fontSize:13, fontFamily:"monospace" }}>
                  {c.symbol} {c.code}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:10 }}>Other</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {other.map(c => {
              const sel = selectedCurrencies.includes(c.code)
              return (
                <button key={c.code} onClick={() => toggleCurrency(c.code)}
                  style={{ padding:"6px 12px", borderRadius:8, border:"1px solid "+(sel?"#6366F1":"rgba(255,255,255,0.08)"), background:sel?"rgba(99,102,241,0.12)":"transparent", color:sel?"#818CF8":"#6B7280", cursor:"pointer", fontSize:12, fontFamily:"monospace" }}>
                  {c.symbol} {c.code}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize:11, color:"#4B5563", marginTop:10 }}>{selectedCurrencies.length} currencies: {selectedCurrencies.join(", ")}</p>
        </div>

        {/* Gateway keys */}
        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:24 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Payment gateway keys</h2>
          <p style={{ fontSize:12, color:"#94A3B8", marginBottom:18 }}>Required to accept card payments. UPI works without keys.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><label style={lbl}>RAZORPAY KEY ID</label><input style={inp} value={form.razorpay_key_id} onChange={e => update("razorpay_key_id",e.target.value)} placeholder="rzp_live_..." /></div>
            <div><label style={lbl}>STRIPE PUBLISHABLE KEY</label><input style={inp} value={form.stripe_pub_key} onChange={e => update("stripe_pub_key",e.target.value)} placeholder="pk_live_..." /></div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ padding:"12px 32px", borderRadius:10, fontSize:15, fontWeight:700, background:saved?"#10B981":saving?"#4B5563":"#6366F1", border:"none", color:"#fff", cursor:"pointer" }}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save settings"}
        </button>
      </main>
    </div>
  )
}
