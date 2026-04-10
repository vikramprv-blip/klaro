
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createMerchant, getMerchantByEmail } from "../../lib/actions"

const inp: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"12px 14px", fontSize:14, color:"#F1F5F9", outline:"none", boxSizing:"border-box" }
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontFamily:"monospace", letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6 }

const COUNTRIES = [
  { code:"IN",name:"India" },{ code:"PH",name:"Philippines" },{ code:"ID",name:"Indonesia" },
  { code:"MY",name:"Malaysia" },{ code:"SG",name:"Singapore" },{ code:"AE",name:"UAE" },
  { code:"US",name:"United States" },{ code:"GB",name:"United Kingdom" },
]
const CURRENCIES: Record<string,string> = { IN:"INR",PH:"PHP",ID:"IDR",MY:"MYR",SG:"SGD",AE:"AED",US:"USD",GB:"GBP" }

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode]       = useState<"login"|"signup">("signup")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string|null>(null)
  const [form, setForm]       = useState({ email:"", full_name:"", business_name:"", business_type:"freelancer", country:"IN" })
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]:v }))

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    if (mode === "login") {
      const m = await getMerchantByEmail(form.email)
      if (!m) { setError("No account found."); setLoading(false); return }
      localStorage.setItem("klaro_merchant", JSON.stringify(m))
      router.push("/dashboard"); return
    }
    const { merchant, error } = await createMerchant({ ...form, currency: CURRENCIES[form.country] ?? "USD" })
    setLoading(false)
    if (error || !merchant) { setError(error ?? "Something went wrong."); return }
    localStorage.setItem("klaro_merchant", JSON.stringify(merchant))
    router.push("/dashboard")
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:440, background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:40 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, textDecoration:"none" }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>K</div>
          <span style={{ fontSize:17, fontWeight:700, color:"#F1F5F9" }}>klaro</span>
        </Link>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:6, letterSpacing:"-0.02em" }}>{mode==="signup"?"Create your account":"Welcome back"}</h1>
        <p style={{ fontSize:14, color:"#94A3B8", marginBottom:28 }}>{mode==="signup"?"Free forever. No credit card needed.":"Enter your email to continue."}</p>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {(["signup","login"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"8px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:mode===m?"#6366F1":"transparent", color:mode===m?"#fff":"#94A3B8", cursor:"pointer", fontSize:13, fontWeight:500 }}>
              {m==="signup"?"Sign up":"Log in"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={lbl}>EMAIL ADDRESS</label><input style={inp} type="email" value={form.email} onChange={e => update("email",e.target.value)} placeholder="you@example.com" /></div>
          {mode==="signup" && <>
            <div><label style={lbl}>FULL NAME</label><input style={inp} value={form.full_name} onChange={e => update("full_name",e.target.value)} placeholder="Rahul Sharma" /></div>
            <div><label style={lbl}>BUSINESS NAME (optional)</label><input style={inp} value={form.business_name} onChange={e => update("business_name",e.target.value)} placeholder="Rahul Design Studio" /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><label style={lbl}>I AM A</label>
                <select style={{ ...inp, background:"#111827" }} value={form.business_type} onChange={e => update("business_type",e.target.value)}>
                  <option value="freelancer">Freelancer</option>
                  <option value="agency">Agency</option>
                  <option value="consultant">Consultant</option>
                  <option value="small_business">Small Business</option>
                </select>
              </div>
              <div><label style={lbl}>COUNTRY</label>
                <select style={{ ...inp, background:"#111827" }} value={form.country} onChange={e => update("country",e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </>}
        </div>
        {error && <p style={{ color:"#EF4444", fontSize:13, marginTop:14, textAlign:"center" }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading || !form.email || (mode==="signup" && !form.full_name)}
          style={{ width:"100%", marginTop:20, padding:13, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading?0.6:1 }}>
          {loading?"Please wait...":mode==="signup"?"Create free account →":"Log in →"}
        </button>
      </div>
    </div>
  )
}
