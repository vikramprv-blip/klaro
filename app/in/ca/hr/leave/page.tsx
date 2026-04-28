"use client"
import { useEffect, useState } from "react"

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ employeeId: "", leaveType: "Sick Leave", startDate: "", endDate: "", reason: "" })
  const orgId = "demo-org"

  async function load() {
    const [lr, er] = await Promise.all([
      fetch(`/api/hr/leave?orgId=${orgId}`).then(r => r.json()),
      fetch(`/api/hr/employees?orgId=${orgId}`).then(r => r.json()),
    ])
    setLeaves(Array.isArray(lr) ? lr : [])
    setEmployees(Array.isArray(er) ? er : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: any) {
    e.preventDefault()
    await fetch("/api/hr/leave", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId, status: "pending" })
    })
    setShowForm(false)
    setForm({ employeeId: "", leaveType: "Sick Leave", startDate: "", endDate: "", reason: "" })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/hr/leave", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    load()
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Leave Management</h2>
        <button onClick={() => setShowForm(s => !s)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
          + Apply Leave
        </button>
      </div>
      <p className="text-sm text-gray-500">Casual · Sick · Earned · Public Holidays</p>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Leave Application</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Employee *</label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Leave Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                {["Casual Leave", "Sick Leave", "Earned Leave", "Public Holiday", "Maternity Leave", "Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Start Date *</label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">End Date *</label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Reason</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
            <tr>{["Employee", "Leave Type", "From", "To", "Days", "Status", "Action"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {leaves.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No leave requests yet</td></tr>}
            {leaves.map(l => {
              const days = l.startDate && l.endDate ? Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1 : "—"
              const emp = employees.find(e => e.id === l.employeeId)
              return (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{emp?.name || l.employeeId}</p>
                    <p className="text-xs text-gray-400">{l.employeeId}</p>
                  </td>
                  <td className="px-4 py-3">{l.leaveType}</td>
                  <td className="px-4 py-3 text-gray-500">{l.startDate}</td>
                  <td className="px-4 py-3 text-gray-500">{l.endDate}</td>
                  <td className="px-4 py-3">{days}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status === "approved" ? "bg-green-50 text-green-700" : l.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {l.status === "pending" && <>
                      <button onClick={() => updateStatus(l.id, "approved")} className="text-xs text-green-600 hover:underline">Approve</button>
                      <button onClick={() => updateStatus(l.id, "rejected")} className="text-xs text-red-500 hover:underline">Reject</button>
                    </>}
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
