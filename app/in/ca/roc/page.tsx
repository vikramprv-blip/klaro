"use client"
import { useEffect, useState } from "react"

function daysLeft(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function statusColor(status: string, due?: string) {
  if (status === "filed") return "bg-green-50 text-green-700";
  if (due && daysLeft(due) < 0) return "bg-red-50 text-red-700";
  if (due && daysLeft(due) <= 30) return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function ROCPage() {
  const [filings, setFilings] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState("all")
  const [form, setForm] = useState({
    client_name: "", cin: "", company_type: "Private Limited",
    filing_type: "", form_number: "", financial_year: "2025-26", due_date: "", notes: ""
  })

  async function load() {
    const r = await fetch("/api/ca/roc").then(r => r.json())
    setFilings(r.filings || [])
    setTypes(r.types || [])
    setStats(r.stats || {})
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/roc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setSaving(false)
    setForm({ client_name: "", cin: "", company_type: "Private Limited", filing_type: "", form_number: "", financial_year: "2025-26", due_date: "", notes: "" })
    load()
  }

  async function updateStatus(id: string, status: string, filed_date?: string) {
    await fetch("/api/ca/roc", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, filed_date: filed_date || new Date().toISOString().split("T")[0] }) })
    load()
  }

  const filtered = filings.filter(f => filter === "all" || f.status === filter || (filter === "overdue" && f.status === "pending" && f.due_date && daysLeft(f.due_date) < 0))

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ROC Compliance Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Track MCA filings, annual returns, director KYC and company law compliance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Filings", value: stats.total || 0, color: "bg-blue-50 text-blue-700", filter: "all" },
          { label: "Pending", value: stats.pending || 0, color: "bg-amber-50 text-amber-700", filter: "pending" },
          { label: "Overdue", value: stats.overdue || 0, color: "bg-red-50 text-red-700", filter: "overdue" },
          { label: "Filed", value: stats.filed || 0, color: "bg-green-50 text-green-700", filter: "filed" },
        ].map(s => (
          <button key={s.label} onClick={() => setFilter(s.filter)}
            className={`${s.color} rounded-xl p-4 border text-left ${filter === s.filter ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </button>
        ))}
      </div>

      {/* Add filing */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Add ROC Filing</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client / Company Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">CIN</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="U12345MH2020PTC123456"
              value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Company Type</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.company_type} onChange={e => setForm({ ...form, company_type: e.target.value })}>
              {["Private Limited", "Public Limited", "LLP", "OPC", "Section 8"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Filing Type *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.filing_type}
              onChange={e => {
                const t = types.find((x: any) => x.type === e.target.value)
                setForm({ ...form, filing_type: e.target.value, form_number: t?.form || "" })
              }}>
              <option value="">Select type</option>
              {types.map((t: any) => <option key={t.type} value={t.type}>{t.type} ({t.form})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Form Number</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.form_number} onChange={e => setForm({ ...form, form_number: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Financial Year</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.financial_year} onChange={e => setForm({ ...form, financial_year: e.target.value })}>
              {["2025-26", "2024-25", "2023-24", "2022-23"].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Due Date *</label>
            <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <button disabled={saving} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Adding..." : "Add Filing"}
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Company", "CIN", "Filing Type", "Form", "FY", "Due Date", "Status", "Action"].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No filings yet</td></tr>}
            {filtered.map(f => (
              <tr key={f.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{f.client_name}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{f.cin || "—"}</td>
                <td className="px-4 py-3">{f.filing_type}</td>
                <td className="px-4 py-3 text-blue-600 font-medium">{f.form_number}</td>
                <td className="px-4 py-3 text-gray-500">{f.financial_year}</td>
                <td className="px-4 py-3 text-gray-500">{f.due_date || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(f.status, f.due_date)}`}>
                    {f.status === "pending" && f.due_date && daysLeft(f.due_date) < 0 ? "OVERDUE" : f.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {f.status === "pending" && (
                    <button onClick={() => updateStatus(f.id, "filed")}
                      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">
                      Mark Filed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
