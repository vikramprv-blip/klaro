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

  if (!data) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Total Tasks" value={data.totalTasks} />
        <Card title="Completed This Week" value={data.completedThisWeek} />
        <Card title="Overdue" value={data.overdue} />
        <Card title="Assigned to You" value={data.assignedToYou} />
        <Card title="Unread Notifications" value={data.unreadNotifications} />
      </div>

      <div>
        <h2 className="font-semibold mb-2">Workload</h2>
        <div className="flex gap-2">
          {data.workload.map((w: any, i: number) => (
            <div key={i} className="px-3 py-2 border rounded-xl text-sm">
              {w.status}: {w._count}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Recent Activity</h2>
        <div className="space-y-2">
          {data.recent.map((item: any) => (
            <div key={item.id} className="p-3 border rounded-xl">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-gray-500">
                {item.client?.name} • {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>

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
