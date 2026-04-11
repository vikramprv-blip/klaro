"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/supabase"
import { createMerchant } from "../../lib/actions"
import { COUNTRY_TO_CURRENCY } from "../../lib/types"

const inp: React.CSSProperties = {
  width:"100%", background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.12)", borderRadius:9,
  padding:"12px 14px", fontSize:15, color:"#F1F5F9",
  outline:"none", boxSizing:"border-box",
}
const lbl: React.CSSProperties = {
  display:"block", fontSize:11, fontFamily:"monospace",
  letterSpacing:"0.06em", color:"#94A3B8", marginBottom:6,
}

const COUNTRIES = [
  {code:"IN",name:"India"},{code:"PH",name:"Philippines"},
  {code:"ID",name:"Indonesia"},{code:"MY",name:"Malaysia"},
  {code:"SG",name:"Singapore"},{code:"AE",name:"UAE"},
  {code:"US",name:"United States"},{code:"GB",name:"United Kingdom"},
]
const CURRENCIES: Record<string,string> = {
  IN:"INR",PH:"PHP",ID:"IDR",MY:"MYR",SG:"SGD",AE:"AED",US:"USD",GB:"GBP"
}

const APPS = [
  {
    id:"sparo",
    name:"Sparo",
    tagline:"Smart Payment Links",
    desc:"Create payment links that pass card fees to your client. Keep 100% of what you earn.",
    icon:"⚡",
    color:"#6366F1",
    features:["UPI + Razorpay + Stripe","Fee passthrough","WhatsApp sharing","GST invoicing"],
  },
  {
    id:"varo",
    name:"Varo",
    tagline:"AI Collections Agent",
    desc:"Send invoices, chase payments, negotiate plans — all automatically on WhatsApp.",
    icon:"🤖",
    color:"#8B5CF6",
    features:["AI WhatsApp collections","Payment plan negotiation","Accounting sync","Auto-chase schedule"],
  },
]

type Step = "email" | "otp" | "profile" | "app"

function AuthForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const nextUrl      = searchParams.get("next") || ""

  const [step, setStep]         = useState<Step>("email")
  const [mode, setMode]         = useState<"signup"|"login">("signup")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string|null>(null)
  const [email, setEmail]       = useState("")
  const [otp, setOtp]           = useState("")
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [selectedApps, setSelectedApps]   = useState<string[]>([])
  const [merchantId, setMerchantId]       = useState<string|null>(null)
  const [form, setForm] = useState({
    full_name:"", business_name:"",
    business_type:"freelancer", country:"IN",
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]:v }))

  const toggleApp = (id: string) => {
    setSelectedApps(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id])
  }

  const getRedirectUrl = (apps: string[], fallback: string) => {
    if (fallback && fallback !== "/" && fallback !== "/auth") return fallback
    if (!apps || apps.length === 0) return "/dashboard"
    if (apps.length === 1) {
      return apps[0] === "sparo" ? "/sparo/app" : "/varo/app"
    }
    return "/dashboard"
  }

  const sendOTP = async () => {
    if (!email) return
    if (mode === "signup" && !legalAccepted) {
      setError("Please accept the Terms and Privacy Policy.")
      return
    }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep("otp")
  }

  const verifyOTP = async () => {
    if (otp.length < 4) return
    setLoading(true); setError(null)

    let verified = false
    let userData: any = null

    const { data: d1 } = await supabase.auth.verifyOtp({ email, token: otp, type: "recovery" })
    if (d1?.user) { verified = true; userData = d1 }

    if (!verified) {
      const { data: d2 } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" })
      if (d2?.user) { verified = true; userData = d2 }
    }

    if (!verified) {
      setError("Invalid or expired code. Please click Resend for a fresh code.")
      setLoading(false)
      return
    }

    // Check existing merchant
    const { data: merchant } = await supabase
      .from("merchants").select("*")
      .eq("email", email.toLowerCase()).maybeSingle()

    setLoading(false)

    if (merchant) {
      localStorage.setItem("klaro_merchant", JSON.stringify(merchant))
      const dest = nextUrl || getRedirectUrl(merchant.apps || [], "")
      window.location.href = dest
    } else {
      setStep("profile")
    }
  }

  const createProfile = async () => {
    if (!form.full_name) return
    setLoading(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Session expired."); setLoading(false); return }

    const { merchant, error } = await createMerchant({
      email:             email.toLowerCase(),
      full_name:         form.full_name,
      business_name:     form.business_name || null,
      business_type:     form.business_type,
      country:           form.country,
      currency:          COUNTRY_TO_CURRENCY[form.country] ?? "USD",
      auth_user_id:      user.id,
      terms_accepted_at: new Date().toISOString(),
      terms_version:     "1.0",
      gdpr_consent:      true,
      gdpr_consent_at:   new Date().toISOString(),
    })
    setLoading(false)
    if (error || !merchant) { setError(error ?? "Failed to create account."); return }
    setMerchantId(merchant.id)
    localStorage.setItem("klaro_merchant", JSON.stringify(merchant))
    setStep("app")
  }

  const saveApps = async () => {
    if (selectedApps.length === 0) { setError("Please select at least one app."); return }
    setLoading(true)
    const id = merchantId
    if (id) {
      await supabase.from("merchants").update({
        apps: selectedApps,
        app_selected_at: new Date().toISOString()
      }).eq("id", id)
      // Update localStorage
      const stored = localStorage.getItem("klaro_merchant")
      if (stored) {
        const m = JSON.parse(stored)
        m.apps = selectedApps
        localStorage.setItem("klaro_merchant", JSON.stringify(m))
      }
    }
    setLoading(false)
    const dest = getRedirectUrl(selectedApps, nextUrl)
    window.location.href = dest
  }

  const STEPS = ["email", "otp", "profile", "app"]
  const stepIdx = STEPS.indexOf(step)

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", fontFamily:"system-ui,sans-serif" }}>

      {/* Left panel */}
      <div style={{ width:380, background:"linear-gradient(160deg,#0D1117,#111827)", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"48px 40px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", marginBottom:48 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#fff" }}>K</div>
          <span style={{ fontSize:16, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>klaro</span>
        </Link>
        <span style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em", color:"#10B981", background:"rgba(16,185,129,0.12)", padding:"4px 10px", borderRadius:100, display:"inline-block", marginBottom:12, width:"fit-content" }}>FREE TRIAL</span>
        <h2 style={{ fontSize:26, fontWeight:900, letterSpacing:"-0.02em", marginBottom:12, color:"#F1F5F9", lineHeight:1.2 }}>
          Start free.<br />No credit card.
        </h2>
        <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.7, marginBottom:32 }}>
          Pick your tool. Keep what you earn from day one.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[["⚡","Sparo — Smart Payment Links"],["🤖","Varo — AI Collections Agent"],["🔌","Accounting sync (Tally, Zoho, QB)"],["🔒","Bank-grade security"],["✅","Free plan available forever"]].map(([icon, text]) => (
            <div key={String(text)} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{icon}</div>
              <span style={{ fontSize:13, color:"#94A3B8" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div style={{ width:"100%", maxWidth: step === "app" ? 560 : 420 }}>

          {/* Mode toggle */}
          {step === "email" && (
            <div style={{ display:"flex", gap:6, marginBottom:24, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:4 }}>
              {(["signup","login"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(null) }}
                  style={{ flex:1, padding:"9px", borderRadius:8, border:"none", background:mode===m?"#6366F1":"transparent", color:mode===m?"#fff":"#6B7280", cursor:"pointer", fontSize:14, fontWeight:mode===m?600:400 }}>
                  {m === "signup" ? "Start free trial" : "Sign in"}
                </button>
              ))}
            </div>
          )}

          {/* Progress */}
          <div style={{ display:"flex", gap:4, marginBottom:28 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex:1, height:2, borderRadius:1, background:i <= stepIdx ? "#6366F1" : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>

          {/* Step 1 — Email */}
          {step === "email" && (
            <>
              <h1 style={{ fontSize:24, fontWeight:900, marginBottom:6, letterSpacing:"-0.02em", color:"#F1F5F9" }}>
                {mode === "signup" ? "Create your free account" : "Welcome back"}
              </h1>
              <p style={{ fontSize:14, color:"#94A3B8", marginBottom:24 }}>
                {mode === "signup" ? "We will email you a sign-in code. No password needed." : "Enter your email for a sign-in code."}
              </p>
              <div style={{ marginBottom:16 }}>
                <label style={lbl}>EMAIL ADDRESS</label>
                <input style={inp} type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={e => e.key === "Enter" && sendOTP()} />
              </div>
              {mode === "signup" && (
                <div onClick={() => setLegalAccepted(!legalAccepted)}
                  style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:16, padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:9, cursor:"pointer" }}>
                  <div style={{ width:18, height:18, borderRadius:4, background:legalAccepted?"#6366F1":"transparent", border:"1px solid "+(legalAccepted?"#6366F1":"rgba(255,255,255,0.25)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0, marginTop:1 }}>
                    {legalAccepted ? "✓" : ""}
                  </div>
                  <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6 }}>
                    I agree to Klaro&apos;s{" "}
                    <Link href="/terms" target="_blank" onClick={e => e.stopPropagation()} style={{ color:"#6366F1" }}>Terms</Link>
                    {", "}
                    <Link href="/privacy" target="_blank" onClick={e => e.stopPropagation()} style={{ color:"#6366F1" }}>Privacy</Link>
                    {" & "}
                    <Link href="/cookies" target="_blank" onClick={e => e.stopPropagation()} style={{ color:"#6366F1" }}>Cookies</Link>
                  </p>
                </div>
              )}
              {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"10px 14px", marginBottom:14 }}><p style={{ color:"#FCA5A5", fontSize:13 }}>{error}</p></div>}
              <button onClick={sendOTP} disabled={loading || !email || (mode==="signup" && !legalAccepted)}
                style={{ width:"100%", padding:14, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||!email||(mode==="signup"&&!legalAccepted)?0.4:1, marginBottom:10 }}>
                {loading ? "Sending code..." : mode==="signup" ? "Start free trial →" : "Send sign-in code →"}
              </button>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === "otp" && (
            <>
              <h1 style={{ fontSize:24, fontWeight:900, marginBottom:6, letterSpacing:"-0.02em", color:"#F1F5F9" }}>Check your email</h1>
              <p style={{ fontSize:14, color:"#94A3B8", marginBottom:8 }}>We sent a code to</p>
              <p style={{ fontSize:15, fontWeight:600, color:"#F1F5F9", marginBottom:24 }}>{email}</p>
              <div style={{ marginBottom:16 }}>
                <label style={lbl}>VERIFICATION CODE</label>
                <input autoFocus
                  style={{ ...inp, fontSize:32, letterSpacing:"0.3em", textAlign:"center", fontFamily:"monospace", padding:"16px 14px" }}
                  type="text" inputMode="numeric" maxLength={8}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g,""))}
                  placeholder="000000"
                  onKeyDown={e => e.key==="Enter" && otp.length>=4 && verifyOTP()} />
                <p style={{ fontSize:12, color:"#4B5563", marginTop:6 }}>Check your spam folder if you do not see it</p>
              </div>
              {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"10px 14px", marginBottom:14 }}><p style={{ color:"#FCA5A5", fontSize:13 }}>{error}</p></div>}
              <button onClick={verifyOTP} disabled={loading || otp.length < 4}
                style={{ width:"100%", padding:14, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||otp.length<4?0.4:1, marginBottom:10 }}>
                {loading ? "Verifying..." : "Verify & continue →"}
              </button>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => { setStep("email"); setOtp(""); setError(null) }}
                  style={{ flex:1, padding:10, borderRadius:9, fontSize:13, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#6B7280", cursor:"pointer" }}>
                  ← Different email
                </button>
                <button onClick={() => { setOtp(""); setError(null); sendOTP() }}
                  style={{ flex:1, padding:10, borderRadius:9, fontSize:13, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#6366F1", cursor:"pointer" }}>
                  Resend code
                </button>
              </div>
            </>
          )}

          {/* Step 3 — Profile */}
          {step === "profile" && (
            <>
              <h1 style={{ fontSize:24, fontWeight:900, marginBottom:6, letterSpacing:"-0.02em", color:"#F1F5F9" }}>Almost there!</h1>
              <p style={{ fontSize:14, color:"#94A3B8", marginBottom:24 }}>Set up your profile.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div><label style={lbl}>YOUR NAME</label><input style={inp} value={form.full_name} onChange={e => update("full_name",e.target.value)} placeholder="Rahul Sharma" autoFocus /></div>
                <div><label style={lbl}>BUSINESS NAME (optional)</label><input style={inp} value={form.business_name} onChange={e => update("business_name",e.target.value)} placeholder="Rahul Design Studio" /></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={lbl}>I AM A</label>
                    <select style={{ ...inp, background:"#111827" }} value={form.business_type} onChange={e => update("business_type",e.target.value)}>
                      <option value="freelancer">Freelancer</option>
                      <option value="agency">Agency</option>
                      <option value="consultant">Consultant</option>
                      <option value="small_business">Small Business</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>COUNTRY</label>
                    <select style={{ ...inp, background:"#111827" }} value={form.country} onChange={e => update("country",e.target.value)}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"10px 14px", marginTop:14 }}><p style={{ color:"#FCA5A5", fontSize:13 }}>{error}</p></div>}
              <button onClick={createProfile} disabled={loading || !form.full_name}
                style={{ width:"100%", marginTop:20, padding:14, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||!form.full_name?0.4:1 }}>
                {loading ? "Creating account..." : "Next: Choose your app →"}
              </button>
            </>
          )}

          {/* Step 4 — Choose app */}
          {step === "app" && (
            <>
              <h1 style={{ fontSize:24, fontWeight:900, marginBottom:6, letterSpacing:"-0.02em", color:"#F1F5F9" }}>Choose your app</h1>
              <p style={{ fontSize:14, color:"#94A3B8", marginBottom:28 }}>Select one or both. You can add more later.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
                {APPS.map(app => {
                  const selected = selectedApps.includes(app.id)
                  return (
                    <div key={app.id} onClick={() => toggleApp(app.id)}
                      style={{ background:selected?"rgba(99,102,241,0.1)":"rgba(255,255,255,0.03)", border:"2px solid "+(selected?app.color:"rgba(255,255,255,0.08)"), borderRadius:14, padding:20, cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ width:40, height:40, borderRadius:10, background:app.color+"20", border:"1px solid "+app.color+"40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{app.icon}</div>
                          <div>
                            <p style={{ fontSize:16, fontWeight:700, color:"#F1F5F9", marginBottom:2 }}>{app.name}</p>
                            <p style={{ fontSize:12, color:"#94A3B8" }}>{app.tagline}</p>
                          </div>
                        </div>
                        <div style={{ width:22, height:22, borderRadius:6, background:selected?app.color:"transparent", border:"2px solid "+(selected?app.color:"rgba(255,255,255,0.2)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", flexShrink:0 }}>
                          {selected ? "✓" : ""}
                        </div>
                      </div>
                      <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, marginBottom:12 }}>{app.desc}</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                        {app.features.map(f => (
                          <div key={f} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#94A3B8" }}>
                            <span style={{ color:app.color, fontSize:10 }}>✓</span>{f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"10px 14px", marginBottom:14 }}><p style={{ color:"#FCA5A5", fontSize:13 }}>{error}</p></div>}
              <button onClick={saveApps} disabled={loading || selectedApps.length === 0}
                style={{ width:"100%", padding:14, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||selectedApps.length===0?0.4:1 }}>
                {loading ? "Setting up..." : selectedApps.length === 0 ? "Select at least one app" : `Start with ${selectedApps.map(a => a.charAt(0).toUpperCase()+a.slice(1)).join(" + ")} →`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#0A0F1E" }} />}>
      <AuthForm />
    </Suspense>
  )
}
