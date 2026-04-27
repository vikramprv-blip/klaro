"use client"

import { useEffect, useState } from "react"

type ActivityItem = {
  id: string
  document_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

export default function DocumentActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    fetch("/api/us/documents/activity")
      .then((res) => res.json())
      .then((data) => setActivity(data.activity || []))
  }, [])

  return (
    <div className="rounded-2xl border p-5">
      <h2 className="mb-4 text-xl font-semibold">Vault Activity</h2>

      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No vault activity yet.</p>
      ) : (
        <div className="space-y-3">
          {activity.map((item) => (
            <div key={item.id} className="rounded-xl border p-3">
              <p className="font-medium">{item.action}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
