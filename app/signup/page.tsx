"use client"
import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

function SignupForm() {
  const supabase = createClient()
  const params = useSearchParams()
  const router = useRouter()
  const vertical = params?.get("vertical") || "ca"
  const plan = params?.get("plan") || "solo"
  const scanUrl = params?.get("scan") || ""

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    firmName: "",
    phone: "",
  })

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    setError("")

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          firm_name: form.firmName,
          phone: form.phone,
          vertical,
          plan,
          region: vertical === "ca" || vertical === "lawyer" ? "IN" : "US",
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // If email confirmation required
    if (!data.session) {
      setStep(3)
      setLoading(false)
      return
    }

    // Auto-onboard the user into their own isolated firm
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.session.access_token}`
        },
        body: JSON.stringify({
          firm_name: form.firmName || `${form.firstName}'s Firm`,
          admin_name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          vertical,
        })
      })
    } catch {}

    // Redirect to post-login — each user lands in their own workspace
    router.push(scanUrl ? `/pulse?scan=${encodeURIComponent(scanUrl)}` : "/post-login")
  }

  if (step === 3) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
        </p>
        <p className="text-xs text-gray-400">
          Already confirmed? <Link href="/signin" className="text-gray-700 underline">Sign in here</Link>
        </p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-black text-gray-900">Klaro</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">
            {scanUrl ? `Sign up to see your scan results for ${(() => { try { return new URL(scanUrl).hostname } catch { return scanUrl } })()}` : "Start your free trial — no credit card required"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step >= s ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>
                {step > s ? "✓" : s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? "bg-gray-900" : "bg-gray-200"}`}/>}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 -mt-6 mb-6 px-1">
          <span>Your details</span><span>Your firm</span>
        </div>

        <form onSubmit={handleSignup} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">First name *</label>
                  <input required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={form.firstName} onChange={e => setF("firstName", e.target.value)}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Last name *</label>
                  <input required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={form.lastName} onChange={e => setF("lastName", e.target.value)}/>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Work email *</label>
                <input required type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="you@firm.com" value={form.email} onChange={e => setF("email", e.target.value)}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Password *</label>
                <input required type="password" minLength={8} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Min. 8 characters" value={form.password} onChange={e => setF("password", e.target.value)}/>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Firm / company name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Smith & Associates" value={form.firmName} onChange={e => setF("firmName", e.target.value)}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setF("phone", e.target.value)}/>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                🔒 Your firm data is completely isolated. No other user can ever see your data. Each firm gets its own secure workspace with row-level security.
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s-1)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                Back
              </button>
            )}
            <button type="submit" disabled={loading}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {loading ? "Creating account..." : step < 2 ? "Continue →" : "Create account →"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account? <Link href="/signin" className="text-gray-700 underline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          By signing up you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>
}
