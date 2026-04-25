"use client"

import { useEffect, useMemo, useState } from "react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [error, setError] = useState<string>("")
  const [editing, setEditing] = useState<any>(null)
  const [query, setQuery] = useState("")

  async function load() {
    const res = await fetch("/api/hr/employees?orgId=demo-org")
    const data = await res.json()
    setEmployees(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    load()
  }, [])

  const filteredEmployees = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return employees

    return employees.filter((e) =>
      [e.name, e.email, e.phone, e.role, e.department, e.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [employees, query])

  async function handleSubmit(e: any) {
    e.preventDefault()
    setError("")
    const form = new FormData(e.target)

    const payload = {
      orgId: "demo-org",
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      role: form.get("role"),
      department: form.get("department"),
      salary: Number(form.get("salary"))
    }

    const res = await fetch(editing ? `/api/hr/employees/${editing.id}` : "/api/hr/employees", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      return
    }

    setEditing(null)
    e.target.reset()
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/hr/employees/${id}`, {
      method: "DELETE"
    })
    load()
  }

  function startEdit(e: any) {
    setEditing(e)
  }

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-sm text-gray-600">Manage employee master records.</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="grid gap-3 border p-4 rounded-xl md:grid-cols-2">
        <input name="name" defaultValue={editing?.name} placeholder="Name" className="border p-2 rounded" />
        <input name="email" defaultValue={editing?.email} placeholder="Email" className="border p-2 rounded" />
        <input name="phone" defaultValue={editing?.phone} placeholder="Phone" className="border p-2 rounded" />
        <input name="role" defaultValue={editing?.role} placeholder="Role" className="border p-2 rounded" />
        <input name="department" defaultValue={editing?.department} placeholder="Department" className="border p-2 rounded" />
        <input name="salary" defaultValue={editing?.salary} placeholder="Salary" className="border p-2 rounded" />

        <button className="bg-black text-white p-2 rounded md:col-span-2">
          {editing ? "Update Employee" : "Add Employee"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="border p-2 rounded md:col-span-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Employee List</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees..."
            className="border p-2 rounded text-sm"
          />
        </div>

        {filteredEmployees.length === 0 && (
          <p className="text-sm text-gray-500">No employees found</p>
        )}

        {filteredEmployees.map((e) => (
          <div key={e.id} className="flex justify-between items-center border-b py-2 text-sm">
            <div>
              <div className="font-medium">{e.name}</div>
              <div className="text-gray-600">
                {e.role || "staff"} — {e.department || "No department"} — ₹{e.salary}
              </div>
              <div className="text-xs text-gray-500">{e.email}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => startEdit(e)} className="text-blue-600 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(e.id)} className="text-red-600 text-xs">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
