"use client"

import { useEffect, useState } from "react"

type ActivityItem = {
  id: string
  type: string
  message: string
  createdAt: string
}

type Props = {
  workItemId: string
}

export function WorkItemActivityFeed({ workItemId }: Props) {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/workboard/${workItemId}/activity`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Failed to load activity")
        const data = await res.json()
        if (active) setItems(data)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [workItemId])

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Activity</h2>

      {loading ? (
        <div style={{ opacity: 0.7 }}>Loading activity...</div>
      ) : items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No activity yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #1e293b",
                borderRadius: 14,
                padding: 14,
                background: "#0f172a",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.message}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                {new Date(item.createdAt).toLocaleString()} • {item.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
