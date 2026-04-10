"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

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

type Step = "email" | "otp" | "profile"

export default function AuthPage() {
  const router  = useRouter()
  const [step, setStep]       = useState<Step>("email")
  const [mode, setMode]       = useState<"signup"|"login">("signup")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string|null>(null)
  const [email, setEmail]     = useState("")
  const [otp, setOtp]         = useState("")
  const [form, setForm]       = useState({
    full_name:"", business_name:"",
    business_type:"freelancer", country:"IN",
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]:v }))

  const sendOTP = async () => {
    if (!email) return
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep("otp")
  }

  const verifyOTP = async () => {
    if (otp.length < 6) return
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.verifyOtp({
      email, token: otp, type: "email"
    })
    if (error) { setError("Invalid code. Please try again."); setLoading(false); return }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    setLoading(false)
    if (merchant) {
      localStorage.setItem("klaro_merchant", JSON.stringify(merchant))
      router.push("/dashboard")
    } else {
      setStep("profile")
    }
  }

  const createProfile = async () => {
    if (!form.full_name) return
    setLoading(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: merchant, error } = await supabase
      .from("merchants")
      .insert({
        email:         email.toLowerCase(),
        full_name:     form.full_name,
        business_name: form.business_name || null,
        business_type: form.business_type,
        country:       form.country,
        currency:      CURRENCIES[form.country] ?? "USD",
        auth_user_id:  user?.id,
      })
      .select()
      .single()
    setLoading(false)
    if (error || !merchant) { setError(error?.message ?? "Failed to create account"); return }
    localStorage.setItem("klaro_merchant", JSON.stringify(merchant))
    router.push("/dashboard")
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:440, background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:40 }}>

        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, textDecoration:"none" }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:14 }}>K</div>
          <span style={{ fontSize:16, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>klaro</span>
        </Link>

        {/* Mode toggle — only show on email step */}
        {step === "email" && (
          <div style={{ display:"flex", gap:8, marginBottom:24, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:4 }}>
            {(["signup","login"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"8px", borderRadius:8, border:"none", background:mode===m?"#6366F1":"transparent", color:mode===m?"#fff":"#6B7280", cursor:"pointer", fontSize:13, fontWeight:mode===m?600:400 }}>
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ display:"flex", gap:4, marginBottom:24 }}>
          {(["email","otp","profile"] as Step[]).map((s, i) => (
            <div key={s} style={{ flex:1, height:2, borderRadius:1, background:(["email","otp","profile"].indexOf(step) >= i) ? "#6366F1" : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>

        {/* Step 1 — Email */}
        {step === "email" && (
          <>
            <h1 style={{ fontSize:21, fontWeight:800, marginBottom:6, letterSpacing:"-0.02em" }}>
              {mode === "signup" ? "Create your free account" : "Welcome back"}
            </h1>
            <p style={{ fontSize:14, color:"#94A3B8", marginBottom:22 }}>
              {mode === "signup"
                ? "Enter your email — we will send you a sign-in code. No password needed."
                : "Enter your email to receive a sign-in code."}
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>EMAIL ADDRESS</label>
              <input style={inp} type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key==="Enter" && sendOTP()} />
            </div>
            {error && <p style={{ color:"#EF4444", fontSize:13, marginBottom:12 }}>{error}</p>}
            <button onClick={sendOTP} disabled={loading || !email}
              style={{ width:"100%", padding:13, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||!email?0.5:1 }}>
              {loading ? "Sending code..." : "Send verification code →"}
            </button>
            {mode === "signup" && (
              <p style={{ fontSize:12, color:"#4B5563", textAlign:"center", marginTop:14 }}>
                Free forever · No credit card needed
              </p>
            )}
          </>
        )}

        {/* Step 2 — OTP */}
        {step === "otp" && (
          <>
            <h1 style={{ fontSize:21, fontWeight:800, marginBottom:6, letterSpacing:"-0.02em" }}>Check your email</h1>
            <p style={{ fontSize:14, color:"#94A3B8", marginBottom:22 }}>
              We sent a 6-digit code to <strong style={{ color:"#F1F5F9" }}>{email}</strong>
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>6-DIGIT CODE</label>
              <input
                style={{ ...inp, fontSize:28, letterSpacing:"0.25em", textAlign:"center", fontFamily:"monospace" }}
                type="text" inputMode="numeric" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,""))}
                placeholder="000000"
                onKeyDown={e => e.key==="Enter" && verifyOTP()} />
            </div>
            {error && <p style={{ color:"#EF4444", fontSize:13, marginBottom:12 }}>{error}</p>}
            <button onClick={verifyOTP} disabled={loading || otp.length < 6}
              style={{ width:"100%", padding:13, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||otp.length<6?0.5:1, marginBottom:10 }}>
              {loading ? "Verifying..." : "Verify & continue →"}
            </button>
            <button onClick={() => { setStep("email"); setOtp(""); setError(null) }}
              style={{ width:"100%", padding:10, borderRadius:10, fontSize:13, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#6B7280", cursor:"pointer" }}>
              ← Use different email
            </button>
            <button onClick={sendOTP}
              style={{ width:"100%", padding:10, borderRadius:10, fontSize:13, background:"transparent", border:"none", color:"#6366F1", cursor:"pointer", marginTop:6 }}>
              Resend code
            </button>
          </>
        )}

        {/* Step 3 — Profile (new users only) */}
        {step === "profile" && (
          <>
            <h1 style={{ fontSize:21, fontWeight:800, marginBottom:6, letterSpacing:"-0.02em" }}>Set up your profile</h1>
            <p style={{ fontSize:14, color:"#94A3B8", marginBottom:22 }}>Almost done — just a few details.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={lbl}>YOUR NAME</label>
                <input style={inp} value={form.full_name} onChange={e => update("full_name",e.target.value)} placeholder="Rahul Sharma" />
              </div>
              <div>
                <label style={lbl}>BUSINESS NAME (optional)</label>
                <input style={inp} value={form.business_name} onChange={e => update("business_name",e.target.value)} placeholder="Rahul Design Studio" />
              </div>
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
            {error && <p style={{ color:"#EF4444", fontSize:13, marginTop:12 }}>{error}</p>}
            <button onClick={createProfile} disabled={loading || !form.full_name}
              style={{ width:"100%", marginTop:20, padding:13, borderRadius:10, fontSize:15, fontWeight:700, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", opacity:loading||!form.full_name?0.5:1 }}>
              {loading ? "Creating account..." : "Start using Klaro →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
