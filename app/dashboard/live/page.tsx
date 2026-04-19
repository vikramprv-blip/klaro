"use client"

import { useEffect, useState } from "react"

export default function LiveDashboard() {
  const [data, setData] = useState<any>(null)

  async function fetchData() {
    const res = await fetch("/api/dashboard/live")
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return <div>Loading...</div>

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card title="Total Tasks" value={data.totalTasks} />
      <Card title="Completed This Week" value={data.completedThisWeek} />
      <Card title="Overdue" value={data.overdue} />
      <Card title="Assigned to You" value={data.assignedToYou} />
      <Card title="Unread Notifications" value={data.unreadNotifications} />
    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}
