"use client"

import { useState, useTransition } from "react"
import { formatDueDate, isOverdue, toDateInputValue } from "@/lib/work-item-date"

type Props = {
  workItemId: string
  dueDate?: string | null
}

export function WorkItemDueDateEditor({ workItemId, dueDate }: Props) {
  const [value, setValue] = useState(toDateInputValue(dueDate))
  const [savedValue, setSavedValue] = useState(toDateInputValue(dueDate))
  const [isPending, startTransition] = useTransition()

  function handleSave(nextValue: string) {
    startTransition(async () => {
      const res = await fetch(`/api/workboard/${workItemId}/due-date`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dueDate: nextValue || null,
        }),
      })

      if (!res.ok) return

      setSavedValue(nextValue)
    })
  }

  const overdue = isOverdue(savedValue)

  return (
    <section
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Due Date</div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: "10px 12px",
            background: "transparent",
          }}
        />

        <button
          type="button"
          onClick={() => handleSave(value)}
          disabled={isPending}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: "10px 14px",
            background: "transparent",
            cursor: "pointer",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={() => {
            setValue("")
            handleSave("")
          }}
          disabled={isPending}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: "10px 14px",
            background: "transparent",
            cursor: "pointer",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          Clear
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          color: overdue ? "#f87171" : "#94a3b8",
        }}
      >
        {savedValue ? `Current: ${formatDueDate(savedValue)}` : "No due date set"}
      </div>
    </section>
  )
}
