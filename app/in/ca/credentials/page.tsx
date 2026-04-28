"use client"
import { useEffect, useState } from "react"

export default function CredentialVaultPage() {
  const [creds, setCreds] = useState<any[]>([])
  const [portals, setPortals] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [revealing, setRevealing] = useState<string | null>(null)
  const [form, setForm] = useState({ client_name: "", portal: "GST Portal (gst.gov.in)", username: "", password: "", notes: "" })
  const [showPass, setShowPass] = useState(false)

  async function load() {
    const r = await fetch("/api/ca/credentials").then(r => r.json())
    setCreds(r.credentials || [])
    setPortals(r.portals || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/credentials", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ client_name: "", portal: "GST Portal (gst.gov.in)", username: "", password: "", notes: "" })
    load()
  }

  async function revealPassword(id: string) {
    if (revealed[id]) { setRevealed(r => { const n = { ...r }; delete n[id]; return n }); return; }
    setRevealing(id)
    const r = await fetch("/api/ca/credentials", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, reveal: true })
    }).then(r => r.json())
    setRevealing(null)
    if (r.password) setRevealed(prev => ({ ...prev, [id]: r.password }))
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this credential?")) return
    await fetch("/api/ca/credentials", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
    })
    load()
  }

  const grouped = creds.reduce((acc, c) => {
    if (!acc[c.client_name]) acc[c.client_name] = []
    acc[c.client_name].push(c)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credential Vault</h1>
        <p className="text-sm text-gray-500 mt-1">Securely store client portal usernames and passwords — AES-256 encrypted</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-amber-600 text-lg">🔐</span>
        <div className="text-sm text-amber-700">
          <p className="font-semibold">Security notice</p>
          <p className="text-xs mt-0.5">All passwords are encrypted with AES-256-CBC before storage. Passwords are never stored in plain text. Only firm admins can access this vault. Use strong, unique passwords for each portal.</p>
        </div>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Add Credentials</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Portal *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.portal} onChange={e => setForm({ ...form, portal: e.target.value })}>
              {portals.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Username / User ID *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Password *</label>
            <div className="flex gap-2">
              <input required type={showPass ? "text" : "password"} className="flex-1 border rounded-lg px-3 py-2 text-sm"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="px-3 border rounded-lg text-xs hover:bg-gray-50">{showPass ? "Hide" : "Show"}</button>
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Mobile OTP on 9876543210"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <button disabled={saving} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Saving..." : "Save Credentials"}
        </button>
      </form>

      {/* Credentials grouped by client */}
      {Object.entries(grouped).map(([clientName, items]) => (
        <div key={clientName} className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">👤 {clientName}</span>
            <span className="text-xs text-gray-400">{(items as any[]).length} credential{(items as any[]).length > 1 ? "s" : ""}</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>{["Portal", "Username", "Password", "Notes", "Last Used", ""].map(h => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {(items as any[]).map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{c.portal}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{c.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {revealed[c.id] ? revealed[c.id] : "••••••••"}
                      </span>
                      <button onClick={() => revealPassword(c.id)}
                        className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-40"
                        disabled={revealing === c.id}>
                        {revealing === c.id ? "..." : revealed[c.id] ? "Hide" : "Reveal"}
                      </button>
                      {revealed[c.id] && (
                        <button onClick={() => navigator.clipboard.writeText(revealed[c.id])}
                          className="text-xs text-gray-400 hover:text-gray-600">Copy</button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.notes || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.last_used ? new Date(c.last_used).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {Object.keys(grouped).length === 0 && (
        <div className="bg-white border rounded-xl px-5 py-10 text-center text-gray-400 text-sm">
          No credentials stored yet — add your first client credentials above
        </div>
      )}
    </div>
  )
}
