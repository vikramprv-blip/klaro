"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

type TimelineItem = {
  date: string
  title: string
  description?: string
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

function parseTimeline(text: string): TimelineItem[] {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    const clean = jsonMatch ? jsonMatch[1] : text
    const parsed = JSON.parse(clean)

    const items = Array.isArray(parsed)
      ? parsed
      : parsed.timeline || parsed.events || []

    return items
      .map((i: any) => ({
        date: String(i.date || "").trim(),
        title: String(i.title || i.event || "").trim(),
        description: i.description ? String(i.description) : "",
      }))
      .filter((i: TimelineItem) => i.title)
      .slice(0, 12)
  } catch {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((line) => ({
        date: "",
        title: line,
      }))
  }
}

export function WorkItemTimeline() {
  const params = useParams<{ id: string }>()

  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [items, setItems] = useState<TimelineItem[]>([])

  async function generate() {
    if (!workItemId) return

    setLoading(true)
    setError("")
    setItems([])

    try {
      const question = [
        "Extract a timeline of key events from the linked documents.",
        "If no linked docs, fallback to client docs.",
        "Return JSON only:",
        '{"timeline":[{"date":"YYYY-MM-DD","title":"","description":""}]}',
        "Keep events short and ordered.",
      ].join(" ")

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, workItemId }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(data?.error || "Failed")

      const text = extractText(data)
      setItems(parseTimeline(text))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Timeline from documents</div>
        <button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate timeline"}
        </button>
      </div>

      {error && <div style={{ color: "red", fontSize: 13 }}>{error}</div>}

      {items.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderLeft: "3px solid #111", paddingLeft: 10 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{item.date}</div>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              {item.description && (
                <div style={{ fontSize: 13, color: "#4b5563" }}>{item.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
