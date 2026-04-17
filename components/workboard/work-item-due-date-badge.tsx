"use client"

import { formatDueDate, isOverdue } from "@/lib/work-item-date"

type Props = {
  dueDate?: string | null
}

export function WorkItemDueDateBadge({ dueDate }: Props) {
  if (!dueDate) {
    return (
      <span
        style={{
          fontSize: 12,
          color: "#94a3b8",
          border: "1px solid #334155",
          borderRadius: 999,
          padding: "4px 8px",
        }}
      >
        No due date
      </span>
    )
  }

  const overdue = isOverdue(dueDate)

  return (
    <span
      style={{
        fontSize: 12,
        color: overdue ? "#fecaca" : "#cbd5e1",
        background: overdue ? "rgba(127, 29, 29, 0.35)" : "transparent",
        border: `1px solid ${overdue ? "#7f1d1d" : "#334155"}`,
        borderRadius: 999,
        padding: "4px 8px",
      }}
    >
      {overdue ? `Overdue · ${formatDueDate(dueDate)}` : `Due · ${formatDueDate(dueDate)}`}
    </span>
  )
}
