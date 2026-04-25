"use client"

import { useEffect, useState } from "react"

export default function AttendanceMonth() {
  const [records, setRecords] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))

  async function load() {
    const res = await fetch("/api/hr/attendance?orgId=demo-org")
    const data = await res.json()
    setRecords(data)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = records.filter(r => r.date.startsWith(month))

  const grouped: Record<string, any[]> = {}
  filtered.forEach(r => {
    if (!grouped[r.employeeId]) grouped[r.employeeId] = []
    grouped[r.employeeId].push(r)
  })

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Monthly Attendance</h1>

      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        className="border p-2 rounded"
      />

      <div className="space-y-4">
        {Object.entries(grouped).map(([empId, recs]) => (
          <div key={empId} className="border p-3 rounded">
            <div className="font-medium mb-2">{recs[0]?.employee?.name || empId}</div>

            <div className="flex gap-2 flex-wrap text-xs">
              {recs.map(r => (
                <div
                  key={r.id}
                  className={`px-2 py-1 rounded ${
                    r.status === "present" ? "bg-green-200" :
                    r.status === "leave" ? "bg-yellow-200" :
                    "bg-red-200"
                  }`}
                >
                  {new Date(r.date).getDate()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
