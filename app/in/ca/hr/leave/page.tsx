"use client"
import { useState, useEffect } from "react"

const LEAVE_TYPES = ["casual", "sick", "earned", "holiday"]
const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
}

export default function LeavePage() {
  const [requests, setRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    employeeId: "", leaveType: "casual",
    fromDate: "", toDate: "", reason: "",
  })
  const orgId = "demo-org"

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    const res = await fetch(`/api/hr/leave?orgId=${orgId}`)
    const data = await res.json()
    setRequests(Array.isArray(data) ? data : [])
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    const from = new Date(form.fromDate)
    const to = new Date(form.toDate)
    const days = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1
    const res = await fetch("/api/hr/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId, days }),
    })
    if (res.ok) {
      setShowForm(false)
      fetchRequests()
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/hr/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchRequests()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">Casual · Sick · Earned · Public Holidays</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm">
          + Apply Leave
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitRequest}
          className="border rounded-xl p-4 mb-6 bg-gray-50 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-medium text-sm">Leave Application</h2>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Employee ID *"
            value={form.employeeId} required
            onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2 text-sm"
            value={form.leaveType}
            onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
            {LEAVE_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>
            ))}
          </select>
          <input className="border rounded-lg px-3 py-2 text-sm" type="date"
            placeholder="From *" value={form.fromDate} required
            onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" type="date"
            placeholder="To *" value={form.toDate} required
            onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm col-span-2"
            placeholder="Reason" value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm">
              Submit
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌴</p>
          <p className="text-sm">No leave requests yet.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Employee</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">From</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">To</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Days</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Reason</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.employee?.name || r.employeeId}</td>
                  <td className="px-4 py-3 capitalize">{r.leaveType}</td>
                  <td className="px-4 py-3">{new Date(r.fromDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">{new Date(r.toDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">{r.days}d</td>
                  <td className="px-4 py-3 text-gray-500">{r.reason || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(r.id, "approved")}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded">
                          Approve
                        </button>
                        <button onClick={() => updateStatus(r.id, "rejected")}
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded">
                          Reject
                        </button>
                      </div>
                    )}
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
