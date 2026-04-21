"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  async function handleLogin() {
    if (!email || !password) { setError("Please fill all fields"); return }
    setLoading(true); setError("")

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }

    const user = data.user
    const session = data.session

    // Register session and enforce plan limits
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          session_token: session.access_token.slice(-32),
          device_info: navigator.userAgent.slice(0, 100),
        }),
      })
      const sessionData = await res.json()

      if (!res.ok && sessionData.error === "session_limit_reached") {
        // Sign them out and show error
        await supabase.auth.signOut()
        setError(sessionData.message)
        setLoading(false)
        return
      }
    } catch {
      // Session tracking failed silently — don't block login
    }

    const vertical = user.user_metadata?.vertical
    router.push(vertical === "ca" ? "/ca" : vertical === "lawyer" ? "/lawyer" : "/ca")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="px-8 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">Klaro</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">Sign in to your Klaro account</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-4 leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@firm.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full mt-5 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-gray-700 hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
