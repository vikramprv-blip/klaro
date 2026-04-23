"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export function WorkItemAIDescription() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestion, setSuggestion] = useState("")

  async function generate() {
    if (!workItemId) return

    setLoading(true)
    setError("")
    setSuggestion("")

    try {
      const question = [
        "Rewrite or generate a clear, professional task description for this work item.",
        "Use linked documents, or fallback to client documents.",
        "Keep it concise (3-5 sentences).",
        "No markdown. Plain text only.",
      ].join(" ")

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, workItemId }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate description")
      }

      const text =
        data?.answer ||
        data?.response ||
        data?.message ||
        data?.result ||
        ""

      setSuggestion(typeof text === "string" ? text : JSON.stringify(text))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function apply() {
    if (!suggestion || !workItemId) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/workboard/${workItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: suggestion }),
      })

      if (!res.ok) {
        throw new Error("Failed to update description")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>AI Description</div>
        <button type="button" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error ? <div style={{ color: "red", fontSize: 13 }}>{error}</div> : null}

      {suggestion ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>Suggested:</div>
          <div style={{ fontSize: 14, background: "#f9fafb", padding: 10, borderRadius: 8 }}>
            {suggestion}
          </div>

          <button type="button" onClick={apply} style={{ marginTop: 8 }} disabled={loading}>
            Apply to task
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Generate a better task description from linked documents.
        </div>
      )}
    </div>
  )
}
