"use client"

import { useState, useEffect } from "react"

export default function BillingPage() {
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<any>(null)
  const [error, setError] = useState("")
  const [paid, setPaid] = useState(false)

  async function createPayment() {
    setLoading(true)
    setError("")
    setPayment(null)

    try {
      const res = await fetch("/api/payments/upi/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: "starter" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Could not create payment")
        return
      }

      setPayment(data)
    } catch {
      setError("Could not create payment")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!payment) return;

    const interval = setInterval(async () => {
      try {
        setChecking(true);
        const res = await fetch("/api/billing/status");
        const data = await res.json();

        if (data?.active) {
          setPaid(true);
          clearInterval(interval);
          window.location.href = "/in/ca";
        }
      } catch {}
      finally { setChecking(false); }
    }, 5000);

    return () => clearInterval(interval);
  }, [payment]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Klaro Billing</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Upgrade to unlock Klaro
        </h1>

        <p className="mt-4 text-gray-600">
          Your account is currently on the free plan. Upgrade to Starter to continue using Klaro.
        </p>

        <div className="mt-8 rounded-xl border bg-gray-50 p-6">
          <h2 className="text-xl font-semibold">Starter plan</h2>

          <p className="mt-2 text-gray-600">
            Client workflows, compliance automation, document AI, reminders, and revenue features are locked for unpaid users.
          </p>

          <div className="mt-5">
            <div className="text-3xl font-semibold">₹999/month</div>
            <p className="mt-1 text-sm text-gray-500">Includes paid access for 30 days.</p>
          </div>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your account email"
            className="mt-6 w-full rounded-lg border px-4 py-3 text-sm"
          />

          <button
            onClick={createPayment}
            disabled={loading || !email}
            className="mt-4 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating payment..." : "Pay via UPI"}
          </button>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {payment && (
            <div className="mt-6 rounded-xl border bg-white p-5">
              <p className="text-sm font-medium">Payment request created</p>
              <p className="mt-2 text-sm text-gray-600">Amount: ₹{payment.amount}</p>
              <p className="mt-1 text-sm text-gray-600">UPI ID: {payment.upiId}</p>

              <a
                href={payment.upiUrl}
                className="mt-4 inline-flex rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white"
              >
                Open UPI app
              </a>

              <p className="mt-4 text-xs text-gray-500">
                After payment is verified, your Klaro account will unlock automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
