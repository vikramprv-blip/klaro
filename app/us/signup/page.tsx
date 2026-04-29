"use client"
import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const PLANS = [
  {
    id: "foundation",
    name: "Foundation",
    price: "$59",
    unit: "/user/mo",
    desc: "Solo practitioners & small firms",
    features: ["Up to 5 users", "Unlimited matters", "25 GB storage", "14-day free trial"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$449",
    unit: "/mo base",
    desc: "Growing law & CPA firms",
    badge: "Most popular",
    features: ["Up to 25 users", "Klaro Sentinel AI", "Cross-firm collaboration", "250 GB storage"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    unit: "",
    desc: "Multi-office & national firms",
    features: ["Unlimited users", "Custom AI", "White-label", "Dedicated success manager"],
  },
]

const FIRM_TYPES = [
  { id: "law", label: "Law Firm", icon: "⚖", desc: "Attorneys, paralegals, legal ops" },
  { id: "cpa", label: "CPA / Accounting Firm", icon: "📊", desc: "CPAs, accountants, tax professionals" },
  { id: "both", label: "Multi-disciplinary Firm", icon: "🔗", desc: "Both legal and accounting services" },
]

const PRACTICE_AREAS_LAW = ["Corporate & M&A", "Litigation", "Real Estate", "Estate Planning", "Tax Law", "Employment", "IP & Patents", "Criminal Defense", "Family Law", "Other"]
const PRACTICE_AREAS_CPA = ["Tax Preparation", "Audit & Assurance", "Advisory", "Forensic Accounting", "Bookkeeping", "Payroll", "Business Valuation", "Other"]

export default function USSignupPage() {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    firmName: "", firmType: "", firmSize: "", practiceAreas: [] as string[],
    plan: "professional", state: "", phone: "",
    heardFrom: "",
  })

  function setF(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  function togglePractice(area: string) {
    setForm(f => ({
      ...f,
      practiceAreas: f.practiceAreas.includes(area)
        ? f.practiceAreas.filter(a => a !== area)
        : [...f.practiceAreas, area]
    }))
  }

  const practiceAreas = form.firmType === "cpa" ? PRACTICE_AREAS_CPA : PRACTICE_AREAS_LAW

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 3) { setStep(s => s + 1); return }

    setLoading(true)
    setError("")

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          region: "us",
          vertical: "us",
          first_name: form.firstName,
          last_name: form.lastName,
          firm_name: form.firmName,
          firm_type: form.firmType,
          plan: form.plan,
          region: "us",
        }
      }
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    // Create firm in the background
    if (data.session) {
      await fetch("/api/us/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: data.session.access_token,
          firmName: form.firmName,
          firmType: form.firmType,
          plan: form.plan,
          state: form.state,
          size: form.firmSize,
          practiceAreas: form.practiceAreas,
        })
      }).catch(() => null)
    }

    // Onboard the user
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user?.id,
          email: form.email,
          vertical: form.firmType === "cpa" ? "ca" : "both",
          plan: form.plan,
          firmName: form.firmName,
          region: "us",
        })
      })
    } catch {}

    window.location.href = "/post-login"
  }

  const US_STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","DC"]

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/us" className="text-sm text-gray-400 hover:text-gray-600">← Back to Klaro US</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Start your 14-day free trial</h1>
          <p className="text-gray-500 text-sm mt-1">No credit card required · Cancel anytime · White-glove migration included</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step >= s ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>{step > s ? "✓" : s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-gray-900" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 -mt-6 mb-6 px-1">
          <span>Your details</span><span>Your firm</span><span>Choose plan</span>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">

          {/* STEP 1 — Personal details */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Your details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">First name *</label>
                  <input required className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={form.firstName} onChange={e => setF("firstName", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Last name *</label>
                  <input required className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={form.lastName} onChange={e => setF("lastName", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Work email *</label>
                <input required type="email" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="you@firm.com"
                  value={form.email} onChange={e => setF("email", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Password *</label>
                <input required type="password" minLength={8} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setF("password", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                <input type="tel" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone} onChange={e => setF("phone", e.target.value)} />
              </div>
            </>
          )}

          {/* STEP 2 — Firm details */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Your firm</h2>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Firm type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {FIRM_TYPES.map(ft => (
                    <button key={ft.id} type="button" onClick={() => setF("firmType", ft.id)}
                      className={`p-3 border rounded-xl text-left transition-colors ${form.firmType === ft.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-400"}`}>
                      <p className="text-xl mb-1">{ft.icon}</p>
                      <p className="text-xs font-semibold">{ft.label}</p>
                      <p className={`text-xs mt-0.5 ${form.firmType === ft.id ? "text-gray-300" : "text-gray-400"}`}>{ft.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Firm name *</label>
                <input required className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Smith & Associates LLP"
                  value={form.firmName} onChange={e => setF("firmName", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Firm size</label>
                  <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={form.firmSize} onChange={e => setF("firmSize", e.target.value)}>
                    <option value="">Select size</option>
                    {["Solo (1)", "2–5", "6–15", "16–50", "50+"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">State</label>
                  <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={form.state} onChange={e => setF("state", e.target.value)}>
                    <option value="">Select state</option>
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {form.firmType && (
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Practice areas (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {practiceAreas.map(area => (
                      <button key={area} type="button" onClick={() => togglePractice(area)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.practiceAreas.includes(area) ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}>
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1">How did you hear about Klaro?</label>
                <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.heardFrom} onChange={e => setF("heardFrom", e.target.value)}>
                  <option value="">Select</option>
                  {["Google Search", "LinkedIn", "Colleague / Referral", "Bar Association", "AICPA", "Conference", "Other"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}

          {/* STEP 3 — Plan selection */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Choose your plan</h2>
              <p className="text-sm text-gray-500">All plans include a 14-day free trial. No credit card required today.</p>
              <div className="space-y-3">
                {PLANS.map(plan => (
                  <button key={plan.id} type="button" onClick={() => setF("plan", plan.id)}
                    className={`w-full border-2 rounded-xl p-4 text-left transition-all ${form.plan === plan.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          {plan.badge && <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">{plan.badge}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                          {plan.features.map(f => <span key={f} className="text-xs text-gray-500">✓ {f}</span>)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-xl font-bold text-gray-900">{plan.price}</p>
                        <p className="text-xs text-gray-400">{plan.unit}</p>
                      </div>
                    </div>
                    {plan.id === "enterprise" && (
                      <p className="text-xs text-blue-600 mt-2">Contact us for a custom quote → us@klaro.services</p>
                    )}
                  </button>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
                <p className="font-semibold mb-1">White-glove migration guarantee</p>
                <p>We migrate your data from Clio, MyCase, QuickBooks, or any system — free. If anything is wrong, we fix it.</p>
              </div>
              <p className="text-xs text-gray-400 text-center">By signing up you agree to Klaro's <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link></p>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                Back
              </button>
            )}
            <button type="submit" disabled={loading || (step === 2 && !form.firmType) || (step === 2 && !form.firmName)}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {loading ? "Creating your account..." : step < 3 ? "Continue →" : form.plan === "enterprise" ? "Request access" : "Start free trial"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account? <Link href="/us/signin" className="underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
