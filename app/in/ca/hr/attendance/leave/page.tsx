"use client"

import { useEffect, useState } from "react"

export default function LeavePage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/hr/employees?orgId=demo-org")
      .then(r => r.json())
      .then(setEmployees)
  }, [])

  async function submit(e: any) {
    e.preventDefault()
    const f = new FormData(e.target)

    const res = await fetch("/api/hr/attendance/leave", {
      method: "POST",
      body: JSON.stringify({
        orgId: "demo-org",
        employeeId: f.get("employeeId"),
        from: f.get("from"),
        to: f.get("to"),
        reason: f.get("reason")
      })
    })

    const data = await res.json()
    setMsg(`Leave applied for ${data.count} days`)
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Apply Leave</h1>

      <form onSubmit={submit} className="grid gap-3 border p-4 rounded-xl md:grid-cols-2">
        <select name="employeeId" className="border p-2 rounded">
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <input type="date" name="from" className="border p-2 rounded" />
        <input type="date" name="to" className="border p-2 rounded" />
        <input name="reason" placeholder="Reason" className="border p-2 rounded" />

        <button className="bg-black text-white p-2 rounded md:col-span-2">
          Apply Leave
        </button>
      </form>

      {msg && <div className="text-green-600 text-sm">{msg}</div>}
    </main>
  )
}
