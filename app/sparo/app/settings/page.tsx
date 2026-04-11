"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SparoSidebar from "../../../../components/SparoSidebar"
import { supabase } from "../../../../lib/supabase"
import type { Merchant } from "../../../../lib/types"

const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

export default function SparoSettingsPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [saved, setSaved]       = useState(false)
  const [form, setForm] = useState({
    upi_id:"", default_fee_pct:"2.5", razorpay_key_id:"", stripe_pub_key:"", branding_name:""
  })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    if (!m.apps?.includes("sparo")) { router.push("/auth"); return }
    setMerchant(m)
    supabase.from("sparo_settings").select("*").eq("merchant_id", m.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          upi_id: data.upi_id || "",
          default_fee_pct: String(data.default_fee_pct || 2.5),
          razorpay_key_id: data.razorpay_key_id || "",
          stripe_pub_key: data.stripe_pub_key || "",
          branding_name: data.branding_name || "",
        })
      })
  }, [router])

  const handleSave = async () => {
    if (!merchant) return
    await supabase.from("sparo_settings").upsert({
      merchant_id: merchant.id,
      upi_id: form.upi_id || null,
      default_fee_pct: parseFloat(form.default_fee_pct) || 2.5,
      razorpay_key_id: form.razorpay_key_id || null,
      stripe_pub_key: form.stripe_pub_key || null,
      branding_name: form.branding_name || null,
    }, { onConflict: "merchant_id" })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!merchant) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <SparoSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1, maxWidth:680 }}>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4, letterSpacing:"-0.02em" }}>Sparo Settings</h1>
        <p style={{ fontSize:14, color:"#94A3B8", marginBottom:28 }}>Configure your payment preferences</p>

        {[
          { title:"Payment details", fields:[
            { key:"upi_id",         label:"YOUR UPI ID",             placeholder:"name@okicici" },
            { key:"default_fee_pct",label:"DEFAULT FEE % TO PASS ON",placeholder:"2.5", type:"number" },
            { key:"branding_name",  label:"BUSINESS NAME ON LINKS",  placeholder:"Your Business Name" },
          ]},
          { title:"Gateway keys (optional)", fields:[
            { key:"razorpay_key_id",label:"RAZORPAY KEY ID",  placeholder:"rzp_live_..." },
            { key:"stripe_pub_key", label:"STRIPE PUBLIC KEY",placeholder:"pk_live_..." },
          ]},
        ].map(section => (
          <div key={section.title} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>{section.title}</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {section.fields.map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input style={inp} type={f.type||"text"} value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSave} style={{ padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700, background:saved?"#10B981":"#6366F1", border:"none", color:"#fff", cursor:"pointer" }}>
          {saved ? "Saved ✓" : "Save settings"}
        </button>
      </main>
    </div>
  )
}
