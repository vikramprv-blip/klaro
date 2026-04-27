"use client"
import { useEffect, useState } from "react"

export default function LawyerTimesheetsPage() {
  const [sheets, setSheets] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({ employee_id: "", date: new Date().toISOString().split("T")[0], hours: "", description: "", billable: "true" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const [tr, er] = await Promise.all([
      fetch("/api/hr/timesheet?orgId=demo-org").then(r => r.json()),
      fetch("/api/hr/employees?orgId=demo-org").then(r => r.json())
    ])
    setSheets(Array.isArray(tr) ? tr : [])
    setEmployees(Array.isArray(er) ? er : [])
  }

  useEffect(() => { load() }, [])

  async function handleLog(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/hr/timesheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, billable: form.billable === "true", orgId: "demo-org" })
    })
    setSaving(false)
    load()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Timesheets</h1>
      <form onSubmit={handleLog} className="bg-white border rounded-xl p-5 grid grid-cols-2 gap-3">
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
          <label className="text-xs text-gray-500">Hours</label>
          <input type="number" step="0.5" className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Billable</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.billable} onChange={e => setForm({...form, billable: e.target.value})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500">Description</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="col-span-2">
          <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            {saving ? "Logging..." : "Log Time"}
          </button>
        </div>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Employee","Date","Hours","Billable","Description"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {sheets.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No timesheet entries</td></tr>}
            {sheets.map((s,i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 font-medium">{s.employee_name || s.employee_id}</td>
                <td className="px-4 py-3 text-gray-500">{s.date}</td>
                <td className="px-4 py-3 font-semibold">{s.hours}h</td>
                <td className="px-4 py-3">{s.billable ? <span className="text-green-600 text-xs font-medium">✓ Billable</span> : <span className="text-gray-400 text-xs">Non-billable</span>}</td>
                <td className="px-4 py-3 text-gray-500">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
