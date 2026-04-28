"use client"
import { useEffect, useState } from "react"

const PROVIDERS = [
  { id: "digio", name: "Digio", url: "https://www.digio.in", desc: "₹15–25/sign. Aadhaar OTP + biometric. Most popular in India." },
  { id: "leegality", name: "Leegality", url: "https://www.leegality.com", desc: "₹20–30/sign. Aadhaar e-sign + DSC. Used by 3,000+ companies." },
  { id: "signdesk", name: "SignDesk", url: "https://www.signdesk.com", desc: "₹12–20/sign. Aadhaar OTP e-sign. Good for bulk signing." },
  { id: "manual", name: "Manual (track only)", url: "", desc: "Track e-sign requests without integration. Mark signed manually." },
]

export default function ESignPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [docTypes, setDocTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"requests" | "setup">("requests")
  const [form, setForm] = useState({
    document_name: "", document_type: "Form 16 / 16A",
    signer_name: "", signer_email: "", signer_phone: "",
    notes: "", send_email: true
  })

  async function load() {
    const r = await fetch("/api/ca/esign").then(r => r.json())
    setRequests(r.requests || [])
    setDocTypes(r.doc_types || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSend(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/esign", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ document_name: "", document_type: "Form 16 / 16A", signer_name: "", signer_email: "", signer_phone: "", notes: "", send_email: true })
    load()
  }

  async function markSigned(id: string) {
    await fetch("/api/ca/esign", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "signed" })
    })
    load()
  }

  const pending = requests.filter(r => r.status === "pending").length
  const signed = requests.filter(r => r.status === "signed").length

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-Sign</h1>
        <p className="text-sm text-gray-500 mt-1">Request Aadhaar-based e-signatures from clients — legally valid under IT Act 2000</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[{ key: "requests", label: "Sign Requests" }, { key: "setup", label: "Integration Setup" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Requests", value: requests.length, color: "bg-blue-50 text-blue-700" },
              { label: "Pending Signature", value: pending, color: "bg-amber-50 text-amber-700" },
              { label: "Signed", value: signed, color: "bg-green-50 text-green-700" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
                <p className="text-xs font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Legal notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">Legal validity of Aadhaar e-sign in India</p>
            <p className="text-xs">Aadhaar-based e-signatures are legally valid under Section 3A of the Information Technology Act, 2000, read with the Second Schedule. They are equivalent to handwritten signatures for most documents including financial statements, Form 16, audit reports and client agreements. Court filings, wills and property transfers still require physical signatures.</p>
          </div>

          {/* New request form */}
          <form onSubmit={handleSend} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">New E-Sign Request</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Document Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Form 16 — Ramesh Sharma FY 2024-25"
                  value={form.document_name} onChange={e => setForm({ ...form, document_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Document Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })}>
                  {docTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Signer Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.signer_name} onChange={e => setForm({ ...form, signer_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Signer Email *</label>
                <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.signer_email} onChange={e => setForm({ ...form, signer_email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Signer Phone</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.signer_phone} onChange={e => setForm({ ...form, signer_phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.send_email}
                  onChange={e => setForm({ ...form, send_email: e.target.checked })}
                  className="rounded" />
                <span className="text-sm text-gray-700">Send email notification to signer</span>
              </label>
            </div>
            <button disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
              {saving ? "Sending..." : "Create E-Sign Request"}
            </button>
          </form>

          {/* Requests list */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">All Requests ({requests.length})</h2>
            </div>
            {requests.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No e-sign requests yet</p>}
            {requests.map(r => (
              <div key={r.id} className="px-4 py-4 border-b last:border-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.document_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.signer_name} · {r.signer_email} · {r.document_type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "signed" ? "bg-green-50 text-green-700" : r.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.status}
                  </span>
                  {r.status === "pending" && (
                    <button onClick={() => markSigned(r.id)}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                      Mark Signed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "setup" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <p className="font-semibold mb-1">Integration status: Manual mode</p>
            <p className="text-xs">Klaro currently tracks e-sign requests and sends email notifications. To enable one-click Aadhaar e-sign, integrate with one of the providers below. Cost: ₹12–30 per signature. Activate when you have your first paying client.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PROVIDERS.map(p => (
              <div key={p.id} className={`bg-white border rounded-xl p-5 ${p.id === "manual" ? "border-green-200 bg-green-50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                  {p.id === "manual" && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Currently active</span>}
                </div>
                <p className="text-xs text-gray-600 mb-3">{p.desc}</p>
                {p.url && (
                  <a href={p.url} target="_blank"
                    className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-blue-600 inline-block">
                    Visit {p.name} ↗
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">What each provider needs from you</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p><span className="font-semibold">1.</span> Sign up and complete KYC with the provider</p>
              <p><span className="font-semibold">2.</span> Get API credentials (Client ID + Secret)</p>
              <p><span className="font-semibold">3.</span> Add to Klaro settings → Integrations</p>
              <p><span className="font-semibold">4.</span> Each signature costs ₹12–30 — charged to your Klaro account or directly to the firm</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents that CAN use e-sign in India</h3>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              {["Form 16 / 16A", "Financial statements", "ITR acknowledgement", "Audit reports", "Client agreements", "Letters of engagement", "GST returns", "Board resolutions", "Power of attorney (limited)", "MOUs and contracts"].map(d => (
                <p key={d} className="flex items-center gap-1"><span className="text-green-500">✓</span>{d}</p>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <h4 className="text-xs font-semibold text-red-700 mb-1">Documents that CANNOT use e-sign</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                {["Court filings", "Wills and testaments", "Property sale deeds", "Negotiable instruments"].map(d => (
                  <p key={d} className="flex items-center gap-1"><span className="text-red-400">✗</span>{d}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
