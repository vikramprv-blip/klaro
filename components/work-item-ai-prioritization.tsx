"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

type RankedTask = {
  title: string
  priority: string
  reason?: string
}

function extractText(data: any): string {
  return (
    data?.answer ||
    data?.response ||
    data?.message ||
    data?.result ||
    JSON.stringify(data)
  )
}

function parseRankedTasks(text: string): RankedTask[] {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i)
    const clean = jsonMatch ? jsonMatch[1] : text
    const parsed = JSON.parse(clean)

    const items = Array.isArray(parsed)
      ? parsed
      : parsed.tasks || parsed.rankings || []

    return items
      .map((item: any) => ({
        title: String(item.title || item.task || "").trim(),
        priority: String(item.priority || "").trim().toUpperCase(),
        reason: item.reason ? String(item.reason).trim() : "",
      }))
      .filter((item: RankedTask) => item.title)
      .slice(0, 12)
  } catch {
    return text
      .split("\n")
      .map((line) => line.replace(/^\s*[-*0-9.)]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((title) => ({
        title,
        priority: "",
        reason: "",
      }))
  }
}

export function WorkItemAIPrioritization() {
  const params = useParams<{ id: string }>()
  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [items, setItems] = useState<RankedTask[]>([])

  async function generate() {
    if (!workItemId) return

    setLoading(true)
    setError("")
    setItems([])

    try {
      const question = [
        "Rank the most important likely next tasks for this work item.",
        "Use linked documents first, and if none exist then fallback to client documents.",
        "Return JSON only in this exact shape:",
        '{"tasks":[{"title":"","priority":"HIGH|MEDIUM|LOW","reason":""}]}',
        "Order the tasks from highest priority to lowest priority.",
        "Keep each reason to one short sentence."
      ].join(" ")

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, workItemId }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || "Failed to rank tasks")
      }

      setItems(parseRankedTasks(extractText(data)))
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
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>AI prioritization</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Ranks likely next tasks using linked docs, or client docs if none are linked.
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
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
          {loading ? "Ranking..." : "Rank tasks"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            marginTop: 12,
          }}
        >
          {error}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>#{index + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</div>
                {item.priority ? (
                  <span
                    style={{
                      fontSize: 11,
                      border: "1px solid #d1d5db",
                      borderRadius: 999,
                      padding: "2px 8px",
                      color: "#374151",
                      background: "#ffffff",
                    }}
                  >
                    {item.priority}
                  </span>
                ) : null}
              </div>
              {item.reason ? (
                <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>
                  {item.reason}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
