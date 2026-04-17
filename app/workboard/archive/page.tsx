"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type WorkItem = {
  id: string
  title: string
  status: string
  priority: string
  archivedAt: string | null
  client?: {
    name?: string | null
  } | null
}

export default function WorkboardArchivePage() {
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch("/api/work-items/archived", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load archived items")
      const data = await res.json()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleRestore(id: string) {
    setRestoringId(id)
    try {
      const res = await fetch(`/api/workboard/${id}/restore`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to restore item")

      setItems((current) => current.filter((item) => item.id !== id))
    } finally {
      setRestoringId(null)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  return (
    <main style={{ flex: 1, padding: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Archived Work Items</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>
            Review and restore archived tasks.
          </p>
        </div>

        <Link
          href="/workboard"
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: "10px 14px",
            textDecoration: "none",
          }}
        >
          Back to Workboard
        </Link>
      </div>

      {loading ? (
        <div style={{ opacity: 0.7 }}>Loading archived items...</div>
      ) : items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No archived work items.</div>
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
                <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
                  {item.client?.name || "No client"} • {item.status} • {item.priority}
                </div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
                  Archived: {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : "-"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRestore(item.id)}
                disabled={restoringId === item.id}
                style={{
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "10px 14px",
                  background: "transparent",
                  cursor: "pointer",
                  opacity: restoringId === item.id ? 0.6 : 1,
                }}
              >
                {restoringId === item.id ? "Restoring..." : "Restore"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
