"use client"
// ── SIGNUP PAGE ──────────────────────────────────────────────────────────────
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const VERTICALS = [
  { id: "ca",         label: "Chartered Accountant", desc: "GST, TDS, ITR, advance tax for multiple clients" },
  { id: "lawyer",     label: "Lawyer / Law Firm",    desc: "Case management, deadlines, AI drafting" },
  { id: "individual", label: "Individual",            desc: "Personal ITR, advance tax, GST compliance" },
]

export default function SignupClient() {
  const params    = useSearchParams()
  const router    = useRouter()
  const [step, setStep]           = useState<"vertical"|"details">(params.get("vertical") ? "details" : "vertical")
  const [vertical, setVertical]   = useState(params.get("vertical") ?? "")
  const [name, setName]           = useState("")
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [firmName, setFirmName]   = useState("")
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  async function handleSignup() {
    if (!email || !password || !name) { setError("Please fill all fields"); return }
    setLoading(true); setError("")
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name, firm_name: firmName, vertical },
      },
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push(vertical === "ca" ? "/ca" : vertical === "lawyer" ? "/lawyer" : "/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="px-8 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">Klaro</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md">
          {step === "vertical" ? (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Get started free</h1>
              <p className="text-sm text-gray-400 mb-6">Which best describes you?</p>
              <div className="space-y-3 mb-6">
                {VERTICALS.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setVertical(v.id); setStep("details") }}
                    className="w-full text-left border border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{v.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{v.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-gray-700 hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("vertical")} className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h1>
              <p className="text-sm text-gray-400 mb-6">
                {VERTICALS.find(v => v.id === vertical)?.label} · Free during beta
              </p>

              {error && <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">{error}</div>}

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Vikram Chawla"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                {(vertical === "ca" || vertical === "lawyer") && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Firm name</label>
                    <input type="text" value={firmName} onChange={e => setFirmName(e.target.value)}
                      placeholder="Chawla & Associates"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@firm.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="8+ characters"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full mt-5 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating account..." : "Create account →"}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-gray-700 hover:underline">Sign in</Link>
              </p>
              <p className="text-center text-xs text-gray-300 mt-2">
                By signing up you agree to our Terms and Privacy Policy
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
