"use client"
import { useState, useEffect } from "react"

type CAClient = {
  id: string
  name: string
  entity_type: string
  pan: string | null
  gstin: string | null
  email: string | null
  phone: string | null
  tier: "A" | "B" | "C"
  assigned_to: string | null
  services: string[]
  is_active: boolean
}

const TIER_STYLES = {
  A: "bg-amber-50 text-amber-700 border-amber-200",
  B: "bg-blue-50 text-blue-700 border-blue-200",
  C: "bg-gray-50 text-gray-500 border-gray-200",
}

const ENTITY_LABELS: Record<string, string> = {
  individual: "Individual", proprietorship: "Proprietorship",
  partnership: "Partnership", llp: "LLP",
  private_limited: "Pvt Ltd", public_limited: "Public Ltd",
  trust: "Trust", huf: "HUF",
}

export default function CAClientsPage() {
  const [clients, setClients]   = useState<CAClient[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({
    name: "", entity_type: "individual", pan: "", gstin: "",
    email: "", phone: "", tier: "B", assigned_to: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/ca/clients")
      .then(r => r.json())
      .then(d => { setClients(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.pan ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.gstin ?? "").toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate() {
    setSaving(true)
    const res = await fetch("/api/ca/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setClients(prev => [created, ...prev])
    setShowForm(false)
    setForm({ name: "", entity_type: "individual", pan: "", gstin: "", email: "", phone: "", tier: "B", assigned_to: "" })
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">{clients.length} active clients</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Add client
        </button>
      </div>

      {/* Add client form */}
      {showForm && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-4">New client</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "name",        label: "Name *",       type: "text",   span: 2 },
              { key: "entity_type", label: "Entity type",  type: "select", span: 1 },
              { key: "pan",         label: "PAN",          type: "text",   span: 1 },
              { key: "gstin",       label: "GSTIN",        type: "text",   span: 1 },
              { key: "email",       label: "Email",        type: "email",  span: 1 },
              { key: "phone",       label: "Phone",        type: "text",   span: 1 },
              { key: "tier",        label: "Tier",         type: "select2",span: 1 },
              { key: "assigned_to", label: "Assigned to",  type: "text",   span: 1 },
            ].map(({ key, label, type, span }) => (
              <div key={key} className={span === 2 ? "col-span-2" : ""}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                {type === "select" ? (
                  <select
                    value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  >
                    {Object.entries(ENTITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : type === "select2" ? (
                  <select
                    value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  >
                    <option value="A">A — Priority</option>
                    <option value="B">B — Standard</option>
                    <option value="C">C — Basic</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={!form.name || saving}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save client"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, PAN, or GSTIN..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 mb-4 focus:outline-none focus:border-gray-400"
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Client","Entity","PAN","GSTIN","Tier","Assigned to"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-12 text-sm">
                  {clients.length === 0 ? "No clients yet — add your first client above" : "No clients match your search"}
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{ENTITY_LABELS[c.entity_type] ?? c.entity_type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.pan ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.gstin ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${TIER_STYLES[c.tier]}`}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.assigned_to ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
