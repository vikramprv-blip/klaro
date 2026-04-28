"use client"
import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function USSignInPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    window.location.href = "/post-login"
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/us" className="text-sm text-gray-400 hover:text-gray-600">← Back to Klaro US</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Sign in to Klaro</h1>
          <p className="text-gray-500 text-sm mt-1">US practice management platform</p>
        </div>
        <form onSubmit={handleSignin} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Work email</label>
            <input type="email" required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="you@firm.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Password</label>
            <input type="password" required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <Link href="/forgot-password" className="hover:text-gray-600">Forgot password?</Link>
            <Link href="/us/signup" className="hover:text-gray-600">Create account →</Link>
          </div>
        </form>
      </div>
    </main>
  )
}
