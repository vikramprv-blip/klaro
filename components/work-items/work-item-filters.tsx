"use client"

import { ChangeEvent } from "react"

type Option = { label: string; value: string }

type Props = {
  q: string
  status: string
  priority: string
  assigneeId: string
  onQChange: (value: string) => void
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onAssigneeChange: (value: string) => void
  assignees?: Array<{ id: string; name: string | null; email?: string | null }>
  className?: string
}

const statusOptions: Option[] = [
  { label: "All statuses", value: "all" },
  { label: "Backlog", value: "BACKLOG" },
  { label: "Todo", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
]

const priorityOptions: Option[] = [
  { label: "All priorities", value: "all" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
]

function handleSelect(
  e: ChangeEvent<HTMLSelectElement>,
  cb: (value: string) => void,
) {
  cb(e.target.value)
}

export function WorkItemFilters({
  q,
  status,
  priority,
  assigneeId,
  onQChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  assignees = [],
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className}`}>
      <div className="w-full md:max-w-md">
        <input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Search by title or client"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => handleSelect(e, onStatusChange)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => handleSelect(e, onPriorityChange)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={assigneeId}
          onChange={(e) => handleSelect(e, onAssigneeChange)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All assignees</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name || assignee.email || "Unknown"}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
