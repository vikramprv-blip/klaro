"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export function WorkItemChecklistAutocreate() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ count: number; items: Array<{ id: string; title: string }> } | null>(null)

  async function generateChecklist() {
    if (!workItemId) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch(`/api/work-items/${workItemId}/generate-checklist`, {
        method: "POST",
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate checklist")
      }

      setResult({
        count: Number(data?.count || 0),
        items: Array.isArray(data?.items) ? data.items : [],
      })

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      style={{
        marginTop: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Generate checklist from documents
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Creates real work items from linked docs, or client docs if none are linked.
          </div>
        </div>

        <button
          type="button"
          onClick={generateChecklist}
          disabled={loading}
          style={{
            border: "1px solid #111827",
            background: "#111827",
            color: "#ffffff",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generating..." : "Generate checklist"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #d1fae5",
            background: "#ecfdf5",
            color: "#065f46",
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Created {result.count} task{result.count === 1 ? "" : "s"}
          </div>

          {result.items.length ? (
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {result.items.map((item) => (
                <div key={item.id} style={{ fontSize: 13 }}>
                  • {item.title}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
