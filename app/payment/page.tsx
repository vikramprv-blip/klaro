"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const PLANS: Record<string, { name: string; price: number; label: string }> = {
  solo:     { name: "Solo",     price: 176882, label: "₹1,768.82/mo" },
  practice: { name: "Practice", price: 589882, label: "₹5,898.82/mo" },
  firm:     { name: "Firm",     price: 1769882, label: "₹17,698.82/mo" },
}

function PaymentForm() {
  const searchParams = useSearchParams()
  const plan = searchParams?.get("plan") || "solo"
  const planInfo = PLANS[plan] || PLANS.solo

  const [step, setStep] = useState<"init" | "qr" | "verifying" | "done" | "error">("init")
  const [paymentId, setPaymentId] = useState("")
  const [upiUrl, setUpiUrl] = useState("")
  const [upiRef, setUpiRef] = useState("")
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function initiatePayment() {
    if (!user) { setError("Please sign in first"); return }
    setStep("init")
    setError("")

    const res = await fetch("/api/payments/upi/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        plan,
        userId: user.id,
        amountPaise: planInfo.price,
      }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); return }

    setPaymentId(data.id)
    setUpiUrl(data.upiUrl)
    setStep("qr")
  }

  async function verifyPayment() {
    if (!upiRef.trim()) { setError("Please enter your UPI reference number"); return }
    setStep("verifying")
    setError("")

    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, upiRef, plan, userId: user?.id }),
    })
    const data = await res.json()

    if (data.ok) {
      setStep("done")
    } else {
      setError(data.error || "Verification failed")
      setStep("qr")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">
          ← Back to pricing
        </Link>

        {/* Plan Summary */}
        <div className="bg-white border rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-lg">Klaro {planInfo.name}</h2>
            <span className="text-lg font-bold">{planInfo.label}</span>
          </div>
          <p className="text-sm text-gray-500">Pay via UPI — instant activation</p>
        </div>

        {/* Step: Init */}
        {step === "init" && (
          <div className="bg-white border rounded-2xl p-6 space-y-4">
            <h3 className="font-medium">Pay with UPI</h3>
            <p className="text-sm text-gray-500">
              Click below to generate a UPI payment link. Pay using any UPI app — 
              GPay, PhonePe, Paytm, or any bank UPI app.
            </p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!user && (
              <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                Please <Link href="/signin" className="underline">sign in</Link> first to subscribe.
              </p>
            )}
            <button onClick={initiatePayment} disabled={!user}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-40">
              Generate UPI Payment Link
            </button>
          </div>
        )}

        {/* Step: QR / UPI Link */}
        {step === "qr" && (
          <div className="bg-white border rounded-2xl p-6 space-y-4">
            <h3 className="font-medium">Complete Payment</h3>

            {/* UPI Deep Link Button */}
            <a href={upiUrl}
              className="block w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium text-center">
              Open UPI App to Pay
            </a>

            <div className="text-center text-xs text-gray-400">or pay manually to</div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">UPI ID</p>
              <p className="font-mono font-medium">{process.env.NEXT_PUBLIC_UPI_ID || "klaro@upi"}</p>
              <p className="text-xs text-gray-500 mt-2">Amount: ₹{(planInfo.price / 100).toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">Reference: {paymentId.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">After paying, enter your UPI reference number:</p>
              <input
                className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
                placeholder="e.g. 123456789012 or UPI Ref No."
                value={upiRef}
                onChange={e => setUpiRef(e.target.value)}
              />
              {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
              <button onClick={verifyPayment}
                className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium">
                Verify Payment & Activate
              </button>
            </div>
          </div>
        )}

        {/* Step: Verifying */}
        {step === "verifying" && (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p className="font-medium">Verifying payment...</p>
            <p className="text-sm text-gray-500 mt-1">This usually takes a few seconds</p>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Payment Confirmed!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your Klaro {planInfo.name} subscription is now active.
            </p>
            <Link href="/in/ca"
              className="block w-full py-3 bg-black text-white rounded-xl text-sm font-medium">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading...</div>}>
      <PaymentForm />
    </Suspense>
  )
}
