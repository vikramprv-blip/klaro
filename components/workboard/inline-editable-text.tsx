"use client"

import { useState } from "react"
import { toast } from "sonner"

export function InlineEditableText({
  value,
  onSave,
  className = "",
}: {
  value: string
  onSave: (val: string) => Promise<void>
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  const [loading, setLoading] = useState(false)

  async function save() {
    const clean = text.trim()

    if (!clean || clean === value) {
      setEditing(false)
      setText(value)
      return
    }

    setLoading(true)
    try {
      await onSave(clean)
      toast.success("Updated")
    } catch {
      toast.error("Failed")
      setText(value)
    } finally {
      setLoading(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={text}
        disabled={loading}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save()
          if (e.key === "Escape") {
            setEditing(false)
            setText(value)
          }
        }}
        className={"w-full rounded border px-2 py-1 text-sm " + className}
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={"cursor-pointer hover:underline " + className}
    >
      {value}
    </div>
  )
}
