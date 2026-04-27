"use client"
import { useEffect, useState } from "react"

export default function LawyerAttendancePage() {
  const [records, setRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({ employee_id: "", date: new Date().toISOString().split("T")[0], status: "present", notes: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const [ar, er] = await Promise.all([
      fetch("/api/hr/attendance?orgId=demo-org").then(r => r.json()),
      fetch("/api/hr/employees?orgId=demo-org").then(r => r.json())
    ])
    setRecords(Array.isArray(ar) ? ar : [])
    setEmployees(Array.isArray(er) ? er : [])
  }

  useEffect(() => { load() }, [])

  async function handleMark(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/hr/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId: "demo-org" })
    })
    setSaving(false)
    load()
  }

  const statusColor: any = { present: "bg-green-50 text-green-700", absent: "bg-red-50 text-red-700", leave: "bg-yellow-50 text-yellow-700", half_day: "bg-blue-50 text-blue-700" }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <form onSubmit={handleMark} className="bg-white border rounded-xl p-5 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Employee</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required>
            <option value="">Select employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Status</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {["present","absent","leave","half_day"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Notes</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        </div>
        <div className="col-span-2">
          <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            {saving ? "Saving..." : "Mark Attendance"}
          </button>
        </div>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Employee","Date","Status","Notes"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {records.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No records yet</td></tr>}
            {records.map((r,i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 font-medium">{r.employee_name || r.employee_id}</td>
                <td className="px-4 py-3 text-gray-500">{r.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${statusColor[r.status]||"bg-gray-50 text-gray-600"}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
