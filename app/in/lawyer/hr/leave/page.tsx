"use client"
import { useEffect, useState } from "react"

export default function LawyerLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({ employee_id: "", from_date: "", to_date: "", leave_type: "casual", reason: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const [lr, er] = await Promise.all([
      fetch("/api/hr/leave?orgId=demo-org").then(r => r.json()),
      fetch("/api/hr/employees?orgId=demo-org").then(r => r.json())
    ])
    setLeaves(Array.isArray(lr) ? lr : [])
    setEmployees(Array.isArray(er) ? er : [])
  }

  useEffect(() => { load() }, [])

  async function handleApply(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/hr/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId: "demo-org" })
    })
    setSaving(false)
    setForm({ employee_id: "", from_date: "", to_date: "", leave_type: "casual", reason: "" })
    load()
  }

  const statusColor: any = { pending: "bg-yellow-50 text-yellow-700", approved: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-700" }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Leave Management</h1>
      <form onSubmit={handleApply} className="bg-white border rounded-xl p-5 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Employee</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required>
            <option value="">Select employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Leave Type</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
            {["casual","sick","earned","maternity","paternity"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">From Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.from_date} onChange={e => setForm({...form, from_date: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-gray-500">To Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.to_date} onChange={e => setForm({...form, to_date: e.target.value})} required />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500">Reason</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
        </div>
        <div className="col-span-2">
          <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            {saving ? "Applying..." : "Apply Leave"}
          </button>
        </div>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Employee","Type","From","To","Status","Reason"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {leaves.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No leave requests</td></tr>}
            {leaves.map((l,i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 font-medium">{l.employee_name || l.employee_id}</td>
                <td className="px-4 py-3 capitalize">{l.leave_type}</td>
                <td className="px-4 py-3 text-gray-500">{l.from_date}</td>
                <td className="px-4 py-3 text-gray-500">{l.to_date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${statusColor[l.status]||"bg-gray-50 text-gray-600"}`}>{l.status||"pending"}</span></td>
                <td className="px-4 py-3 text-gray-500">{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
