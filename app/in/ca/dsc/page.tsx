"use client"
import { useEffect, useState } from "react"

function urgencyStyle(u: string) {
  if (u === "expired") return "bg-red-100 text-red-800 border-red-200"
  if (u === "critical") return "bg-red-50 text-red-700 border-red-100"
  if (u === "warning") return "bg-amber-50 text-amber-700 border-amber-100"
  return "bg-green-50 text-green-700 border-green-100"
}

function urgencyLabel(r: any) {
  if (r.urgency === "expired") return `Expired ${Math.abs(r.days_to_expiry)}d ago`
  if (r.days_to_expiry === 0) return "Expires today"
  return `${r.days_to_expiry} days left`
}

export default function DSCPage() {
  const [records, setRecords] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [cas, setCas] = useState<string[]>([])
  const [purposes, setPurposes] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState("all")
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [form, setForm] = useState({
    client_name: "", holder_name: "", pan: "",
    dsc_class: "Class 3", certifying_authority: "eMudhra",
    serial_number: "", issue_date: "", expiry_date: "",
    token_provider: "", email_on_dsc: "", notes: ""
  })

  async function load() {
    const r = await fetch("/api/ca/dsc").then(r => r.json())
    setRecords(r.records || [])
    setStats(r.stats || {})
    setCas(r.cas || [])
    setPurposes(r.purposes || [])
    setClasses(r.classes || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    fetch("/api/ca/clients").then(r=>r.json()).then(d=>setClients(Array.isArray(d)?d:[]))
  }, [])

  function togglePurpose(p: string) {
    setSelectedPurposes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleAdd(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/dsc", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, purposes: selectedPurposes })
    })
    setSaving(false)
    setForm({ client_name: "", holder_name: "", pan: "", dsc_class: "Class 3", certifying_authority: "eMudhra", serial_number: "", issue_date: "", expiry_date: "", token_provider: "", email_on_dsc: "", notes: "" })
    setSelectedPurposes([])
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this DSC record?")) return
    await fetch("/api/ca/dsc", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    load()
  }

  async function markRenewed(id: string, expiry_date: string) {
    await fetch("/api/ca/dsc", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, expiry_date, status: "active", alerted_30: false, alerted_7: false }) })
    load()
  }

  const filtered = filter === "all" ? records : records.filter(r => r.urgency === filter)

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DSC Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Track Digital Signature Certificates for all clients — expiry alerts included</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total DSCs", value: stats.total || 0, key: "all", color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "Expired", value: stats.expired || 0, key: "expired", color: "bg-red-100 text-red-800 border-red-200" },
          { label: "Critical (≤7d)", value: stats.critical || 0, key: "critical", color: "bg-red-50 text-red-700 border-red-100" },
          { label: "Warning (≤30d)", value: stats.warning || 0, key: "warning", color: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "Active", value: stats.ok || 0, key: "ok", color: "bg-green-50 text-green-700 border-green-100" },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`${s.color} border rounded-xl p-4 text-left ${filter === s.key ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </button>
        ))}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add DSC Record</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">DSC Holder Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.holder_name} onChange={e => setForm({ ...form, holder_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">PAN</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase" maxLength={10}
              value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">DSC Class</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.dsc_class} onChange={e => setForm({ ...form, dsc_class: e.target.value })}>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Certifying Authority</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.certifying_authority} onChange={e => setForm({ ...form, certifying_authority: e.target.value })}>
              {cas.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Serial Number</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Issue Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Expiry Date *</label>
            <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email on DSC</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.email_on_dsc} onChange={e => setForm({ ...form, email_on_dsc: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Token Provider (e.g. ePass 2003)</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.token_provider} onChange={e => setForm({ ...form, token_provider: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-2">Purposes</label>
          <div className="flex flex-wrap gap-2">
            {purposes.map(p => (
              <button key={p} type="button" onClick={() => togglePurpose(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${selectedPurposes.includes(p) ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Adding..." : "Add DSC Record"}
        </button>
      </form>

      {/* Records */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">DSC Records ({filtered.length})</h2>
          <div className="flex gap-2">
            <a href="https://www.emudhra.com/dsc-renewal" target="_blank"
              className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-blue-600">eMudhra Renewal ↗</a>
            <a href="https://www.egov-nsdl.co.in" target="_blank"
              className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-blue-600">NSDL DSC ↗</a>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
            <tr>{["Client", "Holder", "Class", "CA", "Issue Date", "Expiry Date", "Status", "Purposes", ""].map(h => (
              <th key={h} className="px-4 py-2 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No DSC records yet</td></tr>}
            {filtered.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.client_name}</p>
                  {r.pan && <p className="text-xs text-gray-400 font-mono">{r.pan}</p>}
                </td>
                <td className="px-4 py-3 text-gray-700">{r.holder_name}</td>
                <td className="px-4 py-3 text-xs font-medium text-blue-700">{r.dsc_class}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{r.certifying_authority}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.issue_date || "—"}</td>
                <td className="px-4 py-3 text-gray-700 text-xs font-medium">{r.expiry_date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyStyle(r.urgency)}`}>
                    {urgencyLabel(r)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(r.purposes || []).slice(0, 2).map((p: string) => (
                      <span key={p} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                    {(r.purposes || []).length > 2 && <span className="text-xs text-gray-400">+{r.purposes.length - 2}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {(r.urgency === "expired" || r.urgency === "critical" || r.urgency === "warning") && (
                      <button onClick={() => {
                        const newExpiry = prompt("Enter new expiry date (YYYY-MM-DD):", "")
                        if (newExpiry) markRenewed(r.id, newExpiry)
                      }} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Renew</button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
