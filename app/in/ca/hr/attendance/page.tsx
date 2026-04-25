"use client"

import { useEffect, useState } from "react"

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([])

  async function load() {
    const res = await fetch("/api/hr/attendance")
    const data = await res.json()
    setRecords(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: any) {
    e.preventDefault()
    const form = new FormData(e.target)

    await fetch("/api/hr/attendance", {
      method: "POST",
      body: JSON.stringify({
        orgId: "demo-org",
        employeeId: form.get("employeeId"),
        date: form.get("date"),
        checkIn: form.get("checkIn"),
        checkOut: form.get("checkOut"),
        status: form.get("status"),
        notes: form.get("notes")
      })
    })

    e.target.reset()
    load()
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 border p-4 rounded-xl md:grid-cols-2">
        <input name="employeeId" placeholder="Employee ID" className="border p-2 rounded" />
        <input name="date" type="date" className="border p-2 rounded" />
        <input name="checkIn" type="datetime-local" className="border p-2 rounded" />
        <input name="checkOut" type="datetime-local" className="border p-2 rounded" />
        <select name="status" className="border p-2 rounded">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
        <input name="notes" placeholder="Notes" className="border p-2 rounded" />

        <button className="bg-black text-white p-2 rounded md:col-span-2">
          Add Attendance
        </button>
      </form>

      <div className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Attendance Records</h2>

        {records.length === 0 && (
          <p className="text-sm text-gray-500">No records yet</p>
        )}

        {records.map((r) => (
          <div key={r.id} className="border-b py-2 text-sm">
            {r.employee?.name || r.employeeId} — {r.status} — {new Date(r.date).toLocaleDateString()}
          </div>
        ))}
      </div>
    </main>
  )
}
