"use client"

import { useEffect, useState } from "react"

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([])

  async function load() {
    const res = await fetch("/api/hr/payroll")
    const data = await res.json()
    setRecords(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: any) {
    e.preventDefault()
    const form = new FormData(e.target)

    await fetch("/api/hr/payroll", {
      method: "POST",
      body: JSON.stringify({
        orgId: "demo-org",
        employeeId: form.get("employeeId"),
        month: form.get("month"),
        baseSalary: Number(form.get("baseSalary")),
        deductions: Number(form.get("deductions")),
        bonus: Number(form.get("bonus")),
        status: form.get("status")
      })
    })

    e.target.reset()
    load()
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payroll</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 border p-4 rounded-xl md:grid-cols-2">
        <input name="employeeId" placeholder="Employee ID" className="border p-2 rounded" />
        <input name="month" placeholder="Month (e.g. 2026-04)" className="border p-2 rounded" />
        <input name="baseSalary" placeholder="Base Salary" className="border p-2 rounded" />
        <input name="deductions" placeholder="Deductions" className="border p-2 rounded" />
        <input name="bonus" placeholder="Bonus" className="border p-2 rounded" />

        <select name="status" className="border p-2 rounded">
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>

        <button className="bg-black text-white p-2 rounded md:col-span-2">
          Add Payroll
        </button>
      </form>

      <div className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Payroll Records</h2>

        {records.length === 0 && (
          <p className="text-sm text-gray-500">No payroll records yet</p>
        )}

        {records.map((p) => (
          <div key={p.id} className="border-b py-2 text-sm">
            {p.employee?.name || p.employeeId} — ₹{p.netPay} — {p.month} — {p.status}
          </div>
        ))}
      </div>
    </main>
  )
}
