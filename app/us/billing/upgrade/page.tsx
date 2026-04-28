"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

const plans = {
  PRO: { name: "Pro", price: "$29/month", storage: "10GB" },
  FIRM: { name: "Firm", price: "$99/month", storage: "100GB" },
} as const

type Plan = keyof typeof plans

function UpgradeContent() {
  const searchParams = useSearchParams()
  const selected = (searchParams?.get("plan") || "PRO").toUpperCase()
  const plan: Plan = selected === "FIRM" ? "FIRM" : "PRO"

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function markPaid() {
    setLoading(true)
    setError(null)

    const res = await fetch("/api/us/billing/core", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        billingStatus: "pending",
        note: `User marked ${plan} manual payment as paid`,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || "Could not submit payment confirmation")
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <a href="/us/billing" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to billing
        </a>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Klaro US Upgrade</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Upgrade to {plans[plan].name}
          </h1>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Selected plan</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">
              {plans[plan].name} · {plans[plan].price}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Storage included: {plans[plan].storage}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Manual payment instructions</p>
            <p className="mt-2">
              Payment is verified manually for now. Send payment using your agreed
              method, then click “I have paid”. Your account will be marked pending
              until verification.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {done ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Payment confirmation submitted. Your US billing status is now pending review.
            </div>
          ) : (
            <button
              onClick={markPaid}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Submitting..." : "I have paid"}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default function UsBillingUpgradePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 px-6 py-10">Loading...</main>}>
      <UpgradeContent />
    </Suspense>
  )
}
