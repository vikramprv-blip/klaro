"use client"
import { useEffect, useState } from "react"

export default function LawyerEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Associate", department: "Litigation", salary: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const r = await fetch("/api/hr/employees?orgId=demo-org")
    const d = await r.json()
    setEmployees(Array.isArray(d) ? d : [])
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/hr/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId: "demo-org" })
    })
    setSaving(false)
    setForm({ name: "", email: "", phone: "", role: "Associate", department: "Litigation", salary: "" })
    load()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Employees</h1>
      <form onSubmit={handleAdd} className="bg-white border rounded-xl p-5 grid grid-cols-2 gap-3">
        {[["name","Name *"],["email","Email"],["phone","Phone"],["role","Role"],["department","Department"],["salary","Salary"]].map(([k,l]) => (
          <div key={k}>
            <label className="text-xs text-gray-500">{l}</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              value={(form as any)[k]} onChange={e => setForm({...form, [k]: e.target.value})}
              required={k==="name"} />
          </div>
        ))}
        <div className="col-span-2">
          <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            {saving ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Name","Email","Role","Department","Salary","Status"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {employees.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No employees yet</td></tr>}
            {employees.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-gray-500">{e.email}</td>
                <td className="px-4 py-3">{e.role}</td>
                <td className="px-4 py-3">{e.department}</td>
                <td className="px-4 py-3">₹{e.salary}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">{e.status||"active"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
