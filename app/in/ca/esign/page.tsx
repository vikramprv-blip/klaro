"use client"
import { useEffect, useState } from "react"
import SearchableSelect from "@/components/SearchableSelect"

const PROVIDERS = [
  { id: "digio", name: "Digio", url: "https://www.digio.in", desc: "₹15–25/sign. Most popular." },
  { id: "leegality", name: "Leegality", url: "https://www.leegality.com", desc: "₹20–30/sign. Used by 3,000+ companies." },
  { id: "signdesk", name: "SignDesk", url: "https://www.signdesk.com", desc: "₹12–20/sign. Good for bulk." },
  { id: "manual", name: "Manual (track only)", url: "", desc: "Track without integration." },
]

export default function ESignPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [docTypes, setDocTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"requests"|"setup">("requests")
  const [form, setForm] = useState({
    document_name: "", document_type: "Form 16 / 16A",
    signer_name: "", signer_email: "", signer_phone: "",
    notes: "", send_email: true, selected_client_id: ""
  })

  async function load() {
    const [r, cr] = await Promise.all([
      fetch("/api/ca/esign").then(r => r.json()),
      fetch("/api/ca/clients").then(r => r.json()),
    ])
    setRequests(r.requests || [])
    setDocTypes(r.doc_types || [])
    setClients(Array.isArray(cr) ? cr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name, sub: c.email || c.phone || "" }))

  async function handleSend(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/esign", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_name: form.document_name, document_type: form.document_type, signer_name: form.signer_name, signer_email: form.signer_email, signer_phone: form.signer_phone, notes: form.notes, send_email: form.send_email })
    })
    setSaving(false)
    setForm({ document_name: "", document_type: "Form 16 / 16A", signer_name: "", signer_email: "", signer_phone: "", notes: "", send_email: true, selected_client_id: "" })
    load()
  }

  async function markSigned(id: string) {
    await fetch("/api/ca/esign", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "signed" }) })
    load()
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-Sign</h1>
        <p className="text-sm text-gray-500 mt-1">Request Aadhaar-based e-signatures — legally valid under IT Act 2000</p>
      </div>

      <div className="flex gap-2 border-b">
        {[{ key: "requests", label: "Sign Requests" }, { key: "setup", label: "Integration Setup" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total", value: requests.length, color: "bg-blue-50 text-blue-700" },
              { label: "Pending", value: requests.filter(r => r.status === "pending").length, color: "bg-amber-50 text-amber-700" },
              { label: "Signed", value: requests.filter(r => r.status === "signed").length, color: "bg-green-50 text-green-700" },
            ].map(s => <div key={s.label} className={`${s.color} rounded-xl p-4 border`}><p className="text-xs font-medium mb-1">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>)}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
            Aadhaar e-signatures are legally valid under Section 3A of the IT Act, 2000. Valid for: Form 16, financial statements, audit reports, client agreements. Not valid for: court filings, wills, property sale deeds.
          </div>

          <form onSubmit={handleSend} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">New E-Sign Request</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Select Client (auto-fills signer details)</label>
                <SearchableSelect
                  options={clientOptions}
                  value={form.selected_client_id}
                  onChange={(val, opt) => {
                    const c = clients.find(cl => cl.id === val)
                    if (c) setForm({ ...form, selected_client_id: val, signer_name: c.name, signer_email: c.email || "", signer_phone: c.phone || "" })
                    else setForm({ ...form, selected_client_id: val })
                  }}
                  placeholder="Search client to auto-fill..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Document Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Form 16 — Ramesh Sharma FY 2024-25"
                  value={form.document_name} onChange={e => setForm({ ...form, document_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Document Type</label>
                <SearchableSelect
                  options={docTypes.map(t => ({ value: t, label: t }))}
                  value={form.document_type}
                  onChange={val => setForm({ ...form, document_type: val })}
                />
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
                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.signer_phone} onChange={e => setForm({ ...form, signer_phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.send_email}
                onChange={e => setForm({ ...form, send_email: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-700">Send email notification to signer</span>
            </label>
            <button disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
              {saving ? "Sending..." : "Create E-Sign Request"}
            </button>
          </form>

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
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "signed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{r.status}</span>
                  {r.status === "pending" && <button onClick={() => markSigned(r.id)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Mark Signed</button>}
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
            <p className="text-xs">Activate Digio, Leegality or SignDesk when you have your first paying client. Cost: ₹12–30 per signature.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PROVIDERS.map(p => (
              <div key={p.id} className={`bg-white border rounded-xl p-5 ${p.id === "manual" ? "border-green-200 bg-green-50" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                  {p.id === "manual" && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-xs text-gray-600 mb-3">{p.desc}</p>
                {p.url && <a href={p.url} target="_blank" className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-blue-600 inline-block">Visit {p.name} ↗</a>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
