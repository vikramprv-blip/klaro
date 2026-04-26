"use client"
import { useState, useEffect } from "react"

type TimeEntry = {
  id: string
  employeeId: string
  clientId: string | null
  clientName: string | null
  serviceType: string | null
  description: string | null
  date: string
  hours: number
  ratePerHour: number
  billable: boolean
  billed: boolean
  status: string
  employee?: { name: string; role: string }
}

const SERVICE_TYPES = [
  "GST Filing", "TDS Compliance", "ITR Filing", "Audit",
  "Accounting", "Advisory", "Legal", "Payroll", "Other"
]

const STATUS_STYLES: Record<string, string> = {
  draft:    "bg-gray-100 text-gray-600",
  submitted:"bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
}

export default function TimesheetsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [form, setForm] = useState({
    employeeId: "", clientId: "", clientName: "",
    serviceType: "", description: "",
    date: new Date().toISOString().split("T")[0],
    hours: "", ratePerHour: "", billable: true,
  })
  const [filter, setFilter] = useState({ status: "", billable: "" })
  const orgId = "demo-org"

  useEffect(() => { fetchEntries() }, [filter])

  async function fetchEntries() {
    setLoading(true)
    const params = new URLSearchParams({ orgId })
    if (filter.status) params.set("status", filter.status)
    const res = await fetch(`/api/hr/timesheet?${params}`)
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function submitEntry(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/hr/timesheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({
        employeeId: "", clientId: "", clientName: "",
        serviceType: "", description: "",
        date: new Date().toISOString().split("T")[0],
        hours: "", ratePerHour: "", billable: true,
      })
      fetchEntries()
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/hr/timesheet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchEntries()
  }

  async function generateInvoice() {
    if (!selected.length) return alert("Select entries to invoice")
    const first = entries.find(e => selected.includes(e.id))
    if (!first?.clientId) return alert("Selected entries must have a client")
    const res = await fetch("/api/hr/timesheet/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId, clientId: first.clientId,
        clientName: first.clientName, entryIds: selected,
      }),
    })
    const data = await res.json()
    if (data.ok) {
      alert(`Invoice ${data.invoice.invoice_number} created! Total: ₹${data.total.toFixed(2)}`)
      setSelected([])
      fetchEntries()
    } else {
      alert(data.error || "Failed to generate invoice")
    }
  }

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)
  const totalBillable = entries.filter(e => e.billable && !e.billed)
    .reduce((s, e) => s + e.hours * e.ratePerHour, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Timesheets</h1>
          <p className="text-sm text-gray-500 mt-1">Log hours · Approve · Generate invoices</p>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={generateInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
              Generate Invoice ({selected.length})
            </button>
          )}
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
            + Log Time
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Hours</p>
          <p className="text-2xl font-semibold mt-1">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Unbilled Amount</p>
          <p className="text-2xl font-semibold mt-1">₹{totalBillable.toLocaleString()}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Entries</p>
          <p className="text-2xl font-semibold mt-1">{entries.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select className="border rounded-lg px-3 py-1.5 text-sm"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Log Time Form */}
      {showForm && (
        <form onSubmit={submitEntry}
          className="border rounded-xl p-4 mb-6 bg-gray-50 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-medium text-sm">Log Time Entry</h2>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Employee ID *"
            value={form.employeeId} required
            onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Client Name"
            value={form.clientName}
            onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2 text-sm"
            value={form.serviceType}
            onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
            <option value="">Service Type</option>
            {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
          <input className="border rounded-lg px-3 py-2 text-sm" type="date"
            value={form.date} required
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" type="number"
            placeholder="Hours *" min="0.5" step="0.5" value={form.hours} required
            onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" type="number"
            placeholder="Rate/hour (₹)" value={form.ratePerHour}
            onChange={e => setForm(f => ({ ...f, ratePerHour: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="col-span-2 flex gap-2">
            <button type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Entries Table */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">⏱</p>
          <p className="text-sm">No time entries yet. Click Log Time to start.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <input type="checkbox"
                    onChange={e => setSelected(e.target.checked ? entries.map(en => en.id) : [])} />
                </th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Employee</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Client</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Service</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Hours</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox"
                      checked={selected.includes(entry.id)}
                      onChange={e => setSelected(s =>
                        e.target.checked ? [...s, entry.id] : s.filter(x => x !== entry.id)
                      )} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(entry.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {entry.employee?.name || entry.employeeId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{entry.clientName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.serviceType || "—"}</td>
                  <td className="px-4 py-3 font-medium">{entry.hours}h</td>
                  <td className="px-4 py-3">
                    {entry.billable
                      ? `₹${(entry.hours * entry.ratePerHour).toLocaleString()}`
                      : <span className="text-gray-400">Non-billable</span>}
                    {entry.billed && <span className="ml-1 text-xs text-green-600">✓ Billed</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[entry.status] || ""}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {entry.status === "draft" && (
                        <button onClick={() => updateStatus(entry.id, "submitted")}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50">
                          Submit
                        </button>
                      )}
                      {entry.status === "submitted" && (
                        <>
                          <button onClick={() => updateStatus(entry.id, "approved")}
                            className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded">
                            Approve
                          </button>
                          <button onClick={() => updateStatus(entry.id, "rejected")}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
