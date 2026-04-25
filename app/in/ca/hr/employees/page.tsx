"use client"

import { useEffect, useState } from "react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)

  async function load() {
    const res = await fetch("/api/hr/employees")
    const data = await res.json()
    setEmployees(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: any) {
    e.preventDefault()
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

    if (editing) {
      await fetch(`/api/hr/employees/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      setEditing(null)
    } else {
      await fetch("/api/hr/employees", {
        method: "POST",
        body: JSON.stringify(payload)
      })
    }

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
      <h1 className="text-2xl font-bold">Employees</h1>

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
      </form>

      <div className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Employee List</h2>

        {employees.length === 0 && (
          <p className="text-sm text-gray-500">No employees yet</p>
        )}

        {employees.map((e) => (
          <div key={e.id} className="flex justify-between items-center border-b py-2 text-sm">
            <div>
              {e.name} — {e.role} — ₹{e.salary}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => startEdit(e)}
                className="text-blue-600 text-xs"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(e.id)}
                className="text-red-600 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
