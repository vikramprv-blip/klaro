"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import KlaroSidebar from "../../../components/KlaroSidebar"
import type { Merchant } from "../../../lib/types"

const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

export default function SettingsPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant|null>(null)
  const [saved, setSaved]       = useState(false)
  const [form, setForm] = useState({ full_name:"", business_name:"", upi_id:"", whatsapp_number:"", default_fee_pct:"2.5" })

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    const m = JSON.parse(stored) as Merchant
    setMerchant(m)
    setForm({
      full_name:        m.full_name ?? "",
      business_name:    m.business_name ?? "",
      upi_id:           m.upi_id ?? "",
      whatsapp_number:  m.whatsapp_number ?? "",
      default_fee_pct:  String(m.default_fee_pct ?? 2.5),
    })
  }, [router])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]:v }))

  const handleSave = () => {
    if (!merchant) return
    const updated = { ...merchant, ...form }
    localStorage.setItem("klaro_merchant", JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!merchant) return null

  const SECTIONS = [
    {
      title: "Profile",
      fields: [
        { key:"full_name",     label:"FULL NAME",      type:"text",   placeholder:"Your full name" },
        { key:"business_name", label:"BUSINESS NAME",  type:"text",   placeholder:"Your business name" },
      ]
    },
    {
      title: "Payment defaults",
      fields: [
        { key:"upi_id",          label:"YOUR UPI ID",         type:"text",   placeholder:"yourname@okicici" },
        { key:"whatsapp_number", label:"WHATSAPP NUMBER",     type:"text",   placeholder:"+91 98765 43210" },
        { key:"default_fee_pct", label:"DEFAULT FEE % TO PASS ON", type:"number", placeholder:"2.5" },
      ]
    }
  ]

  const PLAN_FEATURES: Record<string,string[]> = {
    free:     ["5 payment links/mo","UPI only","Basic dashboard"],
    starter:  ["50 payment links/mo","UPI + Razorpay","Email reminders","No Klaro branding"],
    pro:      ["Unlimited links","All gateways","WhatsApp reminders","GST invoicing","Varo collections"],
    business: ["Everything in Pro","AI assistant (LAM)","Team accounts","Accounting sync","Priority support"],
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <KlaroSidebar merchant={merchant} />
      <main style={{ marginLeft:220, padding:"32px", flex:1, maxWidth:760 }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>Settings</h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>Manage your Klaro account</p>
        </div>

        {SECTIONS.map(sec => (
          <div key={sec.title} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>{sec.title}</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {sec.fields.map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input style={inp} type={f.type} value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSave} style={{ padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700, background:saved?"#10B981":"#6366F1", border:"none", color:"#fff", cursor:"pointer", marginBottom:24, transition:"background 0.2s" }}>
          {saved ? "Saved ✓" : "Save changes"}
        </button>

        <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 }}>
          <h2 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Current plan</h2>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:100, padding:"4px 14px", fontFamily:"monospace", fontSize:12, color:"#6366F1", marginBottom:16 }}>
            {merchant.plan.toUpperCase()}
          </div>
          <ul style={{ listStyle:"none", padding:0, marginBottom:20 }}>
            {(PLAN_FEATURES[merchant.plan] ?? []).map(f => (
              <li key={f} style={{ fontSize:13, color:"#94A3B8", marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#6366F1" }}>✓</span>{f}
              </li>
            ))}
          </ul>
          {merchant.plan !== "business" && (
            <Link href="/sparo#pricing" style={{ display:"inline-block", background:"#6366F1", color:"#fff", fontWeight:700, fontSize:13, padding:"9px 20px", borderRadius:9, textDecoration:"none" }}>
              Upgrade plan →
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
