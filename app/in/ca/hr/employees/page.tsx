"use client"
import { useEffect, useState } from "react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Staff", department: "General", salary: "" })
  const orgId = "demo-org"

  async function load() {
    const r = await fetch(`/api/hr/employees?orgId=${orgId}`).then(r => r.json())
    setEmployees(Array.isArray(r) ? r : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: any) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/hr/employees", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId, salary: Number(form.salary || 0) })
    })
    const data = await res.json()
    setSaving(false)
    if (data.ok) {
      setForm({ name: "", email: "", phone: "", role: "Staff", department: "General", salary: "" })
      load()
    } else alert(data.error)
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete employee ${id}?`)) return
    await fetch("/api/hr/employees", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    load()
  }

  const filtered = employees.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()) || e.id?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Employees</h2>
        <a href={`/api/hr/employees?orgId=${orgId}&export=csv`} className="text-xs text-blue-500 hover:underline">Export CSV</a>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Employee</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "name", label: "Full Name *", required: true, placeholder: "Ramesh Kumar" },
            { key: "email", label: "Email", placeholder: "ramesh@firm.com" },
            { key: "phone", label: "Phone", placeholder: "9876543210" },
            { key: "role", label: "Designation", placeholder: "Manager" },
            { key: "department", label: "Department", placeholder: "Finance" },
            { key: "salary", label: "Monthly Salary (₹)", placeholder: "50000" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
              <input required={f.required} placeholder={f.placeholder} className="w-full border rounded-lg px-3 py-2 text-sm"
                value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Employee ID will be auto-generated (e.g. EMP-RAM-1234)</p>
        <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Adding..." : "Add Employee"}
        </button>
      </form>

      {/* Search */}
      <input className="w-full border rounded-lg px-4 py-2 text-sm"
        placeholder="Search employees by name or ID..."
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* Employee list */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
            <tr>{["Employee ID", "Name", "Designation", "Department", "Salary", "Status", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No employees yet</td></tr>}
            {filtered.map(emp => (
              <tr key={emp.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{emp.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                <td className="px-4 py-3 font-medium">₹{Number(emp.salary || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${emp.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(emp.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
