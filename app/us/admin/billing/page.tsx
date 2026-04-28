"use client"

import { useEffect, useState } from "react"

type Firm = {
  id: string
  name?: string
  email?: string
  plan: string
  billing_status: string
  storage_limit_mb: number
  valid_till: string | null
}

export default function UsAdminBillingPage() {
  const [firms, setFirms] = useState<Firm[]>([])
  const [loading, setLoading] = useState(true)
  const [secret, setSecret] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/us/admin/billing", {
      headers: {
        "x-admin-secret": secret,
      },
    })

    const json = await res.json()

    if (!res.ok) {
      setMessage(json.error || "Could not load US billing")
      setFirms([])
      setLoading(false)
      return
    }

    setFirms(json.firms || [])
    setLoading(false)
  }

  async function activate(firm: Firm) {
    setMessage("")

    const res = await fetch("/api/us/billing/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({
        firmId: firm.id,
        plan: firm.plan,
        note: "Manual payment verified from admin billing page",
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setMessage(json.error || "Activation failed")
      return
    }

    setMessage("Activated successfully")
    await load()
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold text-slate-950">US Billing Admin</h1>
        <p className="mt-2 text-slate-600">Review pending manual payments and activate plans.</p>

        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <label className="text-sm font-medium text-slate-700">Admin secret</label>
          <input
            value={secret}
            onChange={e => setSecret(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Enter KLARO_ADMIN_SECRET"
          />

          <button
            onClick={load}
            disabled={!secret}
            className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Load pending payments
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border bg-white p-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-3">Firm</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Storage</th>
                  <th className="p-3">Valid till</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {firms.map(firm => (
                  <tr key={firm.id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{firm.name || firm.id}</div>
                      <div className="text-xs text-slate-500">{firm.email || ""}</div>
                    </td>
                    <td className="p-3">{firm.plan}</td>
                    <td className="p-3">{firm.billing_status}</td>
                    <td className="p-3">{firm.storage_limit_mb} MB</td>
                    <td className="p-3">{firm.valid_till ? new Date(firm.valid_till).toLocaleDateString() : "-"}</td>
                    <td className="p-3">
                      {firm.billing_status === "pending" ? (
                        <button
                          onClick={() => activate(firm)}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white"
                        >
                          Activate
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No action</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!firms.length && (
                  <tr>
                    <td colSpan={6} className="p-5 text-center text-slate-500">
                      No US firms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
