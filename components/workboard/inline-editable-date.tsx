"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

function toInputValue(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toLabel(value?: string | null) {
  if (!value) return "No due date"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No due date"
  return date.toLocaleDateString()
}

export function InlineEditableDate({
  value,
  onSave,
  className = "",
}: {
  value?: string | null
  onSave: (val: string | null) => Promise<void>
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState("")
  const [loading, setLoading] = useState(false)

  const normalized = useMemo(() => toInputValue(value), [value])

  useEffect(() => {
    setCurrent(normalized)
  }, [normalized])

  async function save(nextValue: string) {
    const normalizedNext = nextValue || ""
    if (normalizedNext === normalized) {
      setEditing(false)
      return
    }

    setLoading(true)
    try {
      await onSave(normalizedNext ? new Date(`${normalizedNext}T00:00:00`).toISOString() : null)
      toast.success("Updated")
    } catch {
      setCurrent(normalized)
      toast.error("Failed")
    } finally {
      setLoading(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="date"
          value={current}
          disabled={loading}
          onChange={(e) => setCurrent(e.target.value)}
          onBlur={() => void save(current)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save(current)
            if (e.key === "Escape") {
              setCurrent(normalized)
              setEditing(false)
            }
          }}
          className={"rounded border bg-white px-2 py-1 text-xs " + className}
        />
        <button
          type="button"
          disabled={loading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => void save("")}
          className="rounded border px-2 py-1 text-xs hover:bg-zinc-50"
        >
          Clear
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={"rounded border px-2 py-1 text-xs hover:bg-zinc-50 " + className}
    >
      {toLabel(value)}
    </button>
  )
}
