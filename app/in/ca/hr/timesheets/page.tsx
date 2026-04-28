"use client"
import { useEffect, useState } from "react"

export default function TimesheetsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState("all")
  const [form, setForm] = useState({
    employeeId: "", clientName: "", serviceType: "GST Filing",
    date: new Date().toISOString().split("T")[0], hours: "", ratePerHour: "", description: ""
  })
  const orgId = "demo-org"

  async function load() {
    const [tr, er, cr] = await Promise.all([
      fetch(`/api/hr/timesheet?orgId=${orgId}`).then(r => r.json()),
      fetch(`/api/hr/employees?orgId=${orgId}`).then(r => r.json()),
      fetch("/api/ca/clients").then(r => r.json()),
    ])
    setEntries(Array.isArray(tr) ? tr : [])
    setEmployees(Array.isArray(er) ? er : [])
    setClients(Array.isArray(cr) ? cr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(e: any) {
    e.preventDefault()
    await fetch("/api/hr/timesheet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId, hours: Number(form.hours), ratePerHour: Number(form.ratePerHour || 0), status: "unbilled" })
    })
    setShowForm(false)
    setForm({ employeeId: "", clientName: "", serviceType: "GST Filing", date: new Date().toISOString().split("T")[0], hours: "", ratePerHour: "", description: "" })
    load()
  }

  async function generateInvoice() {
    const unbilled = entries.filter(e => e.status === "unbilled" && (filter === "all" || e.clientName === filter))
    if (unbilled.length === 0) return alert("No unbilled entries to invoice")
    setGenerating(true)
    const grouped: Record<string, any[]> = {}
    unbilled.forEach(e => { if (!grouped[e.clientName]) grouped[e.clientName] = []; grouped[e.clientName].push(e) })
    for (const [clientName, items] of Object.entries(grouped)) {
      const amount = items.reduce((s, i) => s + (Number(i.hours) * Number(i.ratePerHour || 0)), 0)
      if (amount > 0) {
        await fetch("/api/invoices", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, service_type: "Professional Services — Timesheet", gst_rate: 18, notes: `Auto-generated from ${items.length} timesheet entries for ${clientName}` })
        })
      }
    }
    setGenerating(false)
    alert("Invoices generated successfully!")
    load()
  }

  const totalHours = entries.reduce((s, e) => s + Number(e.hours || 0), 0)
  const unbilledAmount = entries.filter(e => e.status === "unbilled").reduce((s, e) => s + (Number(e.hours || 0) * Number(e.ratePerHour || 0)), 0)

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Timesheets</h2>
          <p className="text-sm text-gray-500">Log hours · Approve · Generate invoices</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateInvoice} disabled={generating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {generating ? "Generating..." : "⚡ Generate Invoices"}
          </button>
          <button onClick={() => setShowForm(s => !s)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            + Log Time
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, color: "bg-blue-50 text-blue-700" },
          { label: "Unbilled Amount", value: `₹${unbilledAmount.toLocaleString("en-IN")}`, color: "bg-amber-50 text-amber-700" },
          { label: "Entries", value: entries.length, color: "bg-gray-100 text-gray-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Log Time Entry</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Employee *</label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Client</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })}>
                <option value="">No client</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Service Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                {["GST Filing", "TDS Filing", "ITR Filing", "Audit", "ROC Compliance", "Advisory", "Bookkeeping", "Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date *</label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Hours *</label>
              <input type="number" step="0.25" required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Rate/Hour (₹)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.ratePerHour} onChange={e => setForm({ ...form, ratePerHour: e.target.value })} />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-gray-500 block mb-1">Description</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="GST return filing, client meeting..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Filter + Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Time Entries ({entries.length})</h3>
          <select className="text-sm border rounded-lg px-3 py-1.5"
            value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="unbilled">Unbilled only</option>
            <option value="billed">Billed only</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
            <tr>{["Date", "Employee", "Client", "Service", "Hours", "Rate", "Amount", "Status"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {entries.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No time entries yet. Click Log Time to start.</td></tr>}
            {entries.filter(e => filter === "all" || e.status === filter).map(e => {
              const emp = employees.find(em => em.id === e.employeeId)
              const amount = Number(e.hours || 0) * Number(e.ratePerHour || 0)
              return (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{e.date}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{emp?.name || e.employeeId}</p>
                    <p className="text-xs text-gray-400">{e.employeeId}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.clientName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{e.serviceType}</td>
                  <td className="px-4 py-3 font-medium">{e.hours}h</td>
                  <td className="px-4 py-3 text-gray-500">₹{Number(e.ratePerHour || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">₹{amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${e.status === "billed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {e.status || "unbilled"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
