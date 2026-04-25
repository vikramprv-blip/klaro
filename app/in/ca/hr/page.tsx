"use client"

import { useEffect, useState } from "react"

export default function HRDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/hr/summary")
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return <div className="p-6">Loading HR dashboard...</div>
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">HR Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border p-4 rounded-xl">
          <h2 className="text-sm text-gray-500">Employees</h2>
          <p className="text-xl font-semibold">{data.totalEmployees}</p>
        </div>

        <div className="border p-4 rounded-xl">
          <h2 className="text-sm text-gray-500">Attendance Records</h2>
          <p className="text-xl font-semibold">{data.totalAttendanceRecords}</p>
        </div>

        <div className="border p-4 rounded-xl">
          <h2 className="text-sm text-gray-500">Total Payroll</h2>
          <p className="text-xl font-semibold">₹{data.totalPayroll}</p>
        </div>
      </div>
    </main>
  )
}
