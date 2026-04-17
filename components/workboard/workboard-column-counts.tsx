"use client"

import { WORK_ITEM_STATUSES, getStatusLabel } from "@/lib/work-item-status"

type WorkItem = {
  id: string
  status: string
}

type Props = {
  items: WorkItem[]
}

export function WorkboardColumnCounts({ items }: Props) {
  const counts = WORK_ITEM_STATUSES.map((status) => ({
    status,
    label: getStatusLabel(status),
    count: items.filter((item) => item.status === status).length,
  }))

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {counts.map((item) => (
        <div
          key={item.status}
          className="rounded-xl border px-4 py-3"
        >
          <div className="text-xs opacity-70">{item.label}</div>
          <div className="mt-1 text-2xl font-semibold">{item.count}</div>
        </div>
      ))}
    </div>
  )
}
