"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Suggestion = {
  title: string
  description?: string
  priority?: string
}

function extractText(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    const preferred =
      obj.answer ??
      obj.response ??
      obj.message ??
      obj.result ??
      obj.text ??
      obj.content

    if (typeof preferred === "string") return preferred
    return JSON.stringify(obj, null, 2)
  }
  return String(payload ?? "")
}

function parseSuggestions(raw: string): Suggestion[] {
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i)
  const candidate = fenced?.[1] ?? raw

  try {
    const parsed = JSON.parse(candidate)
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { tasks?: unknown[] }).tasks)
        ? (parsed as { tasks: unknown[] }).tasks
        : Array.isArray((parsed as { checklist?: unknown[] }).checklist)
          ? (parsed as { checklist: unknown[] }).checklist
          : []

    return list
      .map((item) => {
        if (typeof item === "string") return { title: item.trim() }
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>
          return {
            title: String(obj.title ?? obj.task ?? obj.name ?? "").trim(),
            description: obj.description ? String(obj.description).trim() : "",
            priority: obj.priority ? String(obj.priority).trim() : "",
          }
        }
        return { title: "" }
      })
      .filter((item) => item.title)
      .slice(0, 12)
  } catch {
    return raw
      .split("\n")
      .map((line) => line.replace(/^\s*[-*0-9.)]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((title) => ({ title }))
  }
}

export function WorkItemTaskSuggestions() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [raw, setRaw] = useState("")
  const [items, setItems] = useState<Suggestion[]>([])

  async function generate() {
    if (!workItemId) {
      setError("Missing work item id.")
      return
    }

    setLoading(true)
    setError("")
    setRaw("")
    setItems([])

    try {
      const question = [
        "Based on the linked documents for this work item, and if none exist then fallback to the client documents, generate 5 to 8 concrete next tasks.",
        "Return JSON only in this exact shape:",
        '{"tasks":[{"title":"", "description":"", "priority":"LOW|MEDIUM|HIGH"}]}',
        "Keep each title short and actionable.",
        "Keep each description to one sentence.",
      ].join(" ")

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, workItemId }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Failed to generate suggestions."
        )
      }

      const text = extractText(data)
      setRaw(text)
      setItems(parseSuggestions(text))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
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
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Suggested tasks from documents
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Uses linked docs first, then falls back to client docs.
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
          {loading ? "Generating..." : "Suggest tasks"}
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
          }}
        >
          {error}
        </div>
      ) : null}

      {!error && items.length > 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
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
              {item.description ? (
                <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>
                  {item.description}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {!error && !loading && raw && items.length === 0 ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 13,
            color: "#111827",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 12,
            margin: 0,
          }}
        >
          {raw}
        </pre>
      ) : null}
    </section>
  )
}
