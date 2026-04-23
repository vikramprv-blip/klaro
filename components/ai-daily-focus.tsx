"use client"

import { useState } from "react"

type FocusItem = {
  title: string
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

function parseItems(text: string): FocusItem[] {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i)
    const clean = jsonMatch ? jsonMatch[1] : text
    const parsed = JSON.parse(clean)

    const items = Array.isArray(parsed)
      ? parsed
      : parsed.tasks || parsed.focus || []

    return items
      .map((i: any) => ({
        title: String(i.title || i.task || "").trim(),
        reason: i.reason ? String(i.reason).trim() : "",
      }))
      .filter((i: FocusItem) => i.title)
      .slice(0, 8)
  } catch {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 8)
      .map((line) => ({ title: line }))
  }
}

export function AIDailyFocus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [items, setItems] = useState<FocusItem[]>([])

  async function generate() {
    setLoading(true)
    setError("")
    setItems([])

    try {
      const question = [
        "Based on all tasks and documents, what should I focus on today?",
        "Prioritize the most impactful work.",
        "Return JSON only:",
        '{"tasks":[{"title":"","reason":""}]}',
        "Keep it short and actionable.",
      ].join(" ")

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed")

      setItems(parseItems(extractText(data)))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>AI Daily Focus</div>
        <button onClick={generate} disabled={loading}>
          {loading ? "Thinking..." : "What should I do today?"}
        </button>
      </div>

      {error && <div style={{ color: "red", fontSize: 13 }}>{error}</div>}

      {items.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              {item.reason && (
                <div style={{ fontSize: 13, color: "#6b7280" }}>{item.reason}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
