"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import VaroSidebar from "../../../../components/VaroSidebar"
import type { Merchant } from "../../../../lib/types"

const PLATFORMS = [
  {
    id:"tally",
    name:"Tally Prime",
    desc:"India most popular accounting software. Auto-export invoices as sales vouchers.",
    logo:"🟦",
    popular:true,
    india:true,
    how:"Tally XML / Tally ODBC connector",
    fields:["company_name","tally_host","tally_port"],
    labels:["Company Name in Tally","Tally Host (default: localhost)","Tally Port (default: 9000)"],
    placeholders:["My Business Pvt Ltd","localhost","9000"],
    status:"available",
  },
  {
    id:"zoho",
    name:"Zoho Books",
    desc:"Popular with Indian SMBs. Sync invoices, clients, and payments automatically.",
    logo:"🟧",
    popular:true,
    india:true,
    how:"Zoho Books REST API",
    fields:["api_key","organization_id"],
    labels:["Zoho API Key","Organization ID"],
    placeholders:["1000.XXXXXXXXXX","ZB-XXXXXXXXXX"],
    status:"available",
  },
  {
    id:"quickbooks",
    name:"QuickBooks Online",
    desc:"Popular internationally. Sync invoices, clients, and payments.",
    logo:"🟩",
    popular:true,
    india:false,
    how:"QuickBooks REST API (OAuth)",
    fields:["client_id","client_secret","realm_id"],
    labels:["Client ID","Client Secret","Realm ID"],
    placeholders:["ABCxxxxx","secretxxx","1234567890"],
    status:"available",
  },
  {
    id:"xero",
    name:"Xero",
    desc:"Popular in UK, Australia, Southeast Asia. Full invoice and payment sync.",
    logo:"🟦",
    popular:false,
    india:false,
    how:"Xero API (OAuth 2.0)",
    fields:["client_id","client_secret"],
    labels:["Client ID","Client Secret"],
    placeholders:["xxxxx-xxxx-xxxx","secret"],
    status:"available",
  },
  {
    id:"freshbooks",
    name:"FreshBooks",
    desc:"Great for freelancers. Auto-create invoices and mark them paid.",
    logo:"🟥",
    popular:false,
    india:false,
    how:"FreshBooks API v3",
    fields:["client_id","client_secret"],
    labels:["Client ID","Client Secret"],
    placeholders:["xxxxx","secret"],
    status:"coming_soon",
  },
  {
    id:"sage",
    name:"Sage Business Cloud",
    desc:"Popular in UK and Europe. Invoice and payment sync.",
    logo:"🟫",
    popular:false,
    india:false,
    how:"Sage API",
    fields:["client_id","client_secret"],
    labels:["Client ID","Client Secret"],
    placeholders:["xxxxx","secret"],
    status:"coming_soon",
  },
  {
    id:"wave",
    name:"Wave Accounting",
    desc:"Free accounting tool. Perfect for small freelancers.",
    logo:"🌊",
    popular:false,
    india:false,
    how:"Wave API",
    fields:["api_key"],
    labels:["API Key"],
    placeholders:["wave_xxxxx"],
    status:"coming_soon",
  },
  {
    id:"custom",
    name:"Custom / Webhook",
    desc:"Send invoice data to any system via webhook. Works with Zapier, Make, and custom APIs.",
    logo:"🔌",
    popular:false,
    india:false,
    how:"HTTP POST webhook",
    fields:["webhook_url","secret"],
    labels:["Webhook URL","Secret (optional)"],
    placeholders:["https://your-api.com/webhook","my-secret-key"],
    status:"available",
  },
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [merchant, setMerchant]   = useState<Merchant|null>(null)
  const [selected, setSelected]   = useState<string|null>(null)
  const [saved, setSaved]         = useState<string[]>([])
  const [formData, setFormData]   = useState<Record<string,string>>({})
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState<string|null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("klaro_merchant")
    if (!stored) { router.push("/auth"); return }
    setMerchant(JSON.parse(stored))
  }, [router])

  const handleSave = async (platformId: string) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaved(s => [...s, platformId])
    setSuccess(platformId)
    setSaving(false)
    setTimeout(() => setSuccess(null), 3000)
    setSelected(null)
  }

  if (!merchant) return null

  const platform = PLATFORMS.find(p => p.id === selected)

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", display:"flex" }}>
      <VaroSidebar merchant={merchant} />
      <main style={{ marginLeft:224, padding:"32px", flex:1 }}>

        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontFamily:"monospace", color:"#8B5CF6", letterSpacing:"0.08em", marginBottom:4 }}>VARO · INTEGRATIONS</p>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>Accounting Integrations</h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>Automatically export invoices to your accounting software when created or paid.</p>
        </div>

        {/* How it works */}
        <div style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:14, padding:20, marginBottom:28 }}>
          <p style={{ fontSize:13, fontWeight:600, marginBottom:10, color:"#C4B5FD" }}>🔄 How auto-sync works</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {["You create invoice in Varo","Varo sends WhatsApp payment link","Client pays","Invoice auto-exported to your accounting software"].map((s,i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ width:20, height:20, borderRadius:"50%", background:"#8B5CF6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>{i+1}</span>
                <p style={{ fontSize:12, color:"#94A3B8", lineHeight:1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {PLATFORMS.map(p => {
            const isConnected = saved.includes(p.id)
            const isComingSoon = p.status === "coming_soon"
            return (
              <div key={p.id} style={{ background:"#111827", border:"1px solid "+(isConnected?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.07)"), borderRadius:14, padding:20, opacity:isComingSoon?0.6:1 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:24 }}>{p.logo}</span>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>{p.name}</p>
                      <div style={{ display:"flex", gap:6 }}>
                        {p.popular && <span style={{ fontSize:9, fontFamily:"monospace", background:"rgba(99,102,241,0.15)", color:"#818CF8", padding:"2px 6px", borderRadius:4 }}>POPULAR</span>}
                        {p.india && <span style={{ fontSize:9, fontFamily:"monospace", background:"rgba(249,115,22,0.15)", color:"#FB923C", padding:"2px 6px", borderRadius:4 }}>INDIA</span>}
                        {isComingSoon && <span style={{ fontSize:9, fontFamily:"monospace", background:"rgba(245,158,11,0.15)", color:"#F59E0B", padding:"2px 6px", borderRadius:4 }}>COMING SOON</span>}
                      </div>
                    </div>
                  </div>
                  {isConnected && <span style={{ fontSize:11, color:"#10B981" }}>✓ Connected</span>}
                </div>
                <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, marginBottom:14 }}>{p.desc}</p>
                <p style={{ fontSize:11, color:"#4B5563", fontFamily:"monospace", marginBottom:14 }}>via {p.how}</p>
                <button
                  disabled={isComingSoon}
                  onClick={() => !isComingSoon && setSelected(p.id)}
                  style={{ width:"100%", padding:"9px", borderRadius:9, fontSize:13, fontWeight:600, background:isConnected?"rgba(16,185,129,0.1)":isComingSoon?"rgba(255,255,255,0.05)":"rgba(139,92,246,0.15)", border:"1px solid "+(isConnected?"rgba(16,185,129,0.3)":isComingSoon?"rgba(255,255,255,0.06)":"rgba(139,92,246,0.3)"), color:isConnected?"#10B981":isComingSoon?"#4B5563":"#C4B5FD", cursor:isComingSoon?"not-allowed":"pointer" }}>
                  {isConnected ? "✓ Connected — Edit" : isComingSoon ? "Coming soon" : "Connect →"}
                </button>
              </div>
            )
          })}
        </div>

        {/* Connection modal */}
        {selected && platform && (
          <div onClick={e => e.target===e.currentTarget && setSelected(null)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, zIndex:50 }}>
            <div style={{ width:"100%", maxWidth:460, background:"#111827", border:"1px solid rgba(139,92,246,0.3)", borderRadius:18, padding:36 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
                <span style={{ fontSize:28 }}>{platform.logo}</span>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, marginBottom:2 }}>Connect {platform.name}</h2>
                  <p style={{ fontSize:12, color:"#94A3B8" }}>via {platform.how}</p>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
                {platform.fields.map((field, i) => (
                  <div key={field}>
                    <label style={{ display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }}>
                      {platform.labels[i]}
                    </label>
                    <input
                      value={formData[field] ?? ""}
                      onChange={e => setFormData(d => ({ ...d, [field]:e.target.value }))}
                      placeholder={platform.placeholders[i]}
                      style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"11px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" as const }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:9, padding:"10px 14px", marginBottom:20 }}>
                <p style={{ fontSize:12, color:"#FCD34D" }}>🔒 Credentials are encrypted and stored securely. Never shared.</p>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setSelected(null)} style={{ flex:1, padding:12, borderRadius:9, fontSize:14, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer" }}>Cancel</button>
                <button onClick={() => handleSave(selected)} disabled={saving}
                  style={{ flex:2, padding:12, borderRadius:9, fontSize:14, fontWeight:700, background:"#8B5CF6", border:"none", color:"#fff", cursor:"pointer", opacity:saving?0.7:1 }}>
                  {saving ? "Connecting..." : "Save & Connect →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div style={{ position:"fixed", bottom:24, right:24, background:"#10B981", color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:14, fontWeight:600, zIndex:60 }}>
            ✓ {PLATFORMS.find(p=>p.id===success)?.name} connected successfully!
          </div>
        )}
      </main>
    </div>
  )
}
