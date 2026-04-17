"use client"

import { useEffect, useState } from "react"
import { formatDueDate } from "@/lib/work-item-date"

type WorkItem = {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  client?: {
    name?: string | null
  } | null
}

export function OverdueWorkItems() {
  const [items, setItems] = useState<WorkItem[] | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      const res = await fetch("/api/dashboard/overdue", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      if (active) setItems(data)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Overdue</h2>

      {!items ? (
        <div style={{ opacity: 0.7 }}>Loading overdue items...</div>
      ) : items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No overdue work items.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
                {item.client?.name || "No client"} • {item.status} • {item.priority}
              </div>
              <div style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
                Due {formatDueDate(item.dueDate)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
