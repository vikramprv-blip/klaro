"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

type Option = {
  label: string
  value: string
}

export function InlineEditableSelect({
  value,
  options,
  onSave,
  className = "",
}: {
  value: string
  options: Option[]
  onSave: (val: string) => Promise<void>
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(value)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCurrent(value)
  }, [value])

  async function save(nextValue: string) {
    if (nextValue === value) {
      setEditing(false)
      return
    }

    setLoading(true)
    try {
      await onSave(nextValue)
      toast.success("Updated")
    } catch {
      setCurrent(value)
      toast.error("Failed")
    } finally {
      setLoading(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <select
        autoFocus
        disabled={loading}
        value={current}
        onChange={(e) => {
          const next = e.target.value
          setCurrent(next)
          void save(next)
        }}
        onBlur={() => setEditing(false)}
        className={"rounded border bg-white px-2 py-1 text-xs " + className}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={"rounded border px-2 py-1 text-xs hover:bg-zinc-50 " + className}
    >
      {options.find((option) => option.value === value)?.label ?? value}
    </button>
  )
}
