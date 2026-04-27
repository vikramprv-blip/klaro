"use client"

import { useEffect, useMemo, useState } from "react"

type PlanKey = "FREE" | "PRO" | "FIRM"

type BillingData = {
  used: number
  limit: number
  limitMb: number
  plan: PlanKey
  billingStatus: string
  percent: number
}

const planLabels: Record<PlanKey, string> = {
  FREE: "Free",
  PRO: "Pro",
  FIRM: "Firm",
}

function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function UsBillingCard() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadUsage() {
    setLoading(true)
    setError(null)

    const res = await fetch("/api/us/billing/usage", {
      cache: "no-store",
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || "Could not load billing usage")
      setLoading(false)
      return
    }

    setData(json)
    setLoading(false)
  }

  async function upgrade(plan: PlanKey) {
    setUpgrading(plan)
    setError(null)

    const res = await fetch("/api/us/billing/core", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        billingStatus: "active",
        note: `Manual US upgrade to ${plan}`,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || "Upgrade failed")
      setUpgrading(null)
      return
    }

    await loadUsage()
    setUpgrading(null)
  }

  useEffect(() => {
    loadUsage()
  }, [])

  const percent = useMemo(() => {
    if (!data) return 0
    return Math.min(100, Math.max(0, data.percent || 0))
  }, [data])

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Loading US billing...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!data) return null

  const showUpgrade = percent >= 80 || data.plan === "FREE"

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            US Billing
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {planLabels[data.plan]} Plan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Status:{" "}
            <span className="font-medium text-slate-700">
              {data.billingStatus}
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <p className="font-medium text-slate-900">{percent}% used</p>
          <p className="text-slate-500">
            {formatMb(data.used)} / {formatMb(data.limit)}
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {percent >= 80 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Storage is above 80%. Upgrade your US plan to avoid upload blocks.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showUpgrade && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {data.plan !== "PRO" && (
            <button
              onClick={() => upgrade("PRO")}
              disabled={!!upgrading}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {upgrading === "PRO" ? "Upgrading..." : "Upgrade to Pro · 10GB"}
            </button>
          )}

          {data.plan !== "FIRM" && (
            <button
              onClick={() => upgrade("FIRM")}
              disabled={!!upgrading}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
            >
              {upgrading === "FIRM" ? "Upgrading..." : "Upgrade to Firm · 100GB"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
