"use client"

import { useEffect, useState } from "react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])

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

    await fetch("/api/hr/employees", {
      method: "POST",
      body: JSON.stringify({
        orgId: "demo-org",
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        role: form.get("role"),
        department: form.get("department"),
        salary: Number(form.get("salary"))
      })
    })

    e.target.reset()
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/hr/employees/${id}`, {
      method: "DELETE"
    })
    load()
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Employees</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 border p-4 rounded-xl md:grid-cols-2">
        <input name="name" placeholder="Name" className="border p-2 rounded" />
        <input name="email" placeholder="Email" className="border p-2 rounded" />
        <input name="phone" placeholder="Phone" className="border p-2 rounded" />
        <input name="role" placeholder="Role" className="border p-2 rounded" />
        <input name="department" placeholder="Department" className="border p-2 rounded" />
        <input name="salary" placeholder="Salary" className="border p-2 rounded" />
        <button className="bg-black text-white p-2 rounded md:col-span-2">
          Add Employee
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
            <button
              onClick={() => handleDelete(e.id)}
              className="text-red-600 text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
