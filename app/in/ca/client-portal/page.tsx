"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"

export default function ClientPortalMgmtPage() {
  const [invites, setInvites] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ client_name: "", client_email: "" })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function load() {
    fetch("/api/ca/clients").then(r=>r.json()).then(d=>setClients(Array.isArray(d)?d:[])).catch(()=>{})
    const r = await fetch("/api/ca/client-portal").then(r => r.json())
    setInvites(r.invites || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleInvite(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/client-portal", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ client_name: "", client_email: "" })
    load()
  }

  async function handleDelete(id: string) {
    await fetch("/api/ca/client-portal", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    load()
  }

  function portalLink(token: string) {
    return `${window.location.origin}/client-portal?token=${token}`
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(portalLink(token))
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Give clients a secure link to view their own filing status — no login required</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p><span className="font-semibold">How it works:</span> Add a client's email, generate their portal link, and share it via WhatsApp or email. They can view their GST, ITR and TDS filing status in real time — without needing a Klaro account.</p>
      </div>

      {/* Invite form */}
      <form onSubmit={handleInvite} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Add Client Portal Access</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client Email *</label>
            <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} />
          </div>
        </div>
        <button disabled={saving} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Generating..." : "Generate Portal Link"}
        </button>
      </form>

      {/* Invites list */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Active Portal Links ({invites.length})</h2>
        </div>
        {invites.length === 0 && <p className="px-5 py-8 text-center text-gray-400 text-sm">No portal links yet — add a client above</p>}
        {invites.map(inv => (
          <div key={inv.id} className="px-5 py-4 border-b last:border-0 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{inv.client_name}</p>
              <p className="text-xs text-gray-500">{inv.client_email}</p>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {inv.status}
                </span>
                {inv.last_viewed_at && (
                  <span className="text-xs text-gray-400">Last viewed: {new Date(inv.last_viewed_at).toLocaleDateString("en-IN")}</span>
                )}
                <span className="text-xs text-gray-400">Expires: {new Date(inv.expires_at).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => copyLink(inv.token)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${copied === inv.token ? "bg-green-50 text-green-700 border-green-200" : "hover:bg-gray-50"}`}>
                {copied === inv.token ? "✓ Copied!" : "Copy Link"}
              </button>
              <a href={portalLink(inv.token)} target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs border hover:bg-gray-50">
                Preview ↗
              </a>
              <button onClick={() => handleDelete(inv.id)} className="text-xs text-red-400 hover:text-red-600 px-2">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
