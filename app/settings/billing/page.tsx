"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const PLANS = [
  { id: "free", name: "Free", price: "₹0/mo", features: ["1 user", "50 clients", "Basic invoicing", "GST/TDS/ITR tracking"] },
  { id: "pro", name: "Pro", price: "₹999/mo", features: ["5 users", "Unlimited clients", "All CA features", "HR + Timesheets", "AI Documents", "Priority support"] },
  { id: "firm", name: "Firm", price: "₹2,499/mo", features: ["Unlimited users", "Unlimited clients", "Everything in Pro", "Multi-branch", "Tally export", "Dedicated support"] },
]

export default function BillingPage() {
  const [billing, setBilling] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/billing/status?email=vikramprv@gmail.com")
      .then(r => r.json())
      .then(data => { setBilling(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Subscription & Billing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your plan and payment details</p>
      </div>

      {/* Current Plan */}
      <div className="border rounded-2xl p-5 bg-white mb-6">
        <h2 className="font-semibold mb-3">Current Plan</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg capitalize">{billing?.plan || "Free"}</p>
              <p className={`text-sm mt-1 ${billing?.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                {billing?.status === "active" ? "✓ Active" : "Inactive"}
                {billing?.expires_at && ` · Renews ${new Date(billing.expires_at).toLocaleDateString("en-IN")}`}
              </p>
            </div>
            <Link href="/pricing"
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">
              Upgrade Plan
            </Link>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={`border rounded-2xl p-5 ${
              billing?.plan?.toLowerCase() === plan.id
                ? "border-black bg-gray-50"
                : "bg-white"
            }`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{plan.name}</h3>
              {billing?.plan?.toLowerCase() === plan.id && (
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Current</span>
              )}
            </div>
            <p className="text-lg font-bold mb-3">{plan.price}</p>
            <ul className="space-y-1.5">
              {plan.features.map(f => (
                <li key={f} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Data Export */}
      <div className="border rounded-2xl p-5 bg-white">
        <h2 className="font-semibold mb-1">Data & Account</h2>
        <p className="text-sm text-gray-500 mb-4">Download all your data or delete your account</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
            ⬇ Export All Data (CSV)
          </button>
          <button className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </div>
    </main>
  )
}
