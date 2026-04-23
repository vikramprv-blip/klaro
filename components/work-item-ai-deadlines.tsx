"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

type DeadlineItem = {
  title: string
  dueDate: string
  note?: string
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

function parseDeadlines(text: string): DeadlineItem[] {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i)
    const clean = jsonMatch ? jsonMatch[1] : text
    const parsed = JSON.parse(clean)

    const items = Array.isArray(parsed)
      ? parsed
      : parsed.deadlines || parsed.tasks || []

    return items
      .map((i: any) => ({
        title: String(i.title || i.task || "").trim(),
        dueDate: String(i.dueDate || i.date || "").trim(),
        note: i.note ? String(i.note).trim() : "",
      }))
      .filter((i: DeadlineItem) => i.title && i.dueDate)
      .slice(0, 12)
  } catch {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((line) => ({
        title: line,
        dueDate: "",
      }))
  }
}

export function WorkItemAIDeadlines() {
  const params = useParams<{ id: string }>()

  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [items, setItems] = useState<DeadlineItem[]>([])

  async function generate() {
    if (!workItemId) return

    setLoading(true)
    setError("")
    setItems([])

    try {
      const question = [
        "Extract deadlines or due dates from the linked documents.",
        "If none exist, infer realistic due dates for the tasks.",
        "Return JSON only:",
        '{"deadlines":[{"title":"","dueDate":"YYYY-MM-DD","note":""}]}',
        "Keep titles short and actionable.",
      ].join(" ")

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, workItemId }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed")

      setItems(parseDeadlines(extractText(data)))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>AI deadlines</div>
        <button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Extract deadlines"}
        </button>
      </div>

      {error && <div style={{ color: "red", fontSize: 13 }}>{error}</div>}

      {items.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderLeft: "3px solid #111", paddingLeft: 10 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{item.dueDate}</div>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              {item.note && (
                <div style={{ fontSize: 13, color: "#4b5563" }}>{item.note}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
