"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function BlockerActions({
  workItemId,
}: {
  workItemId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markUrgent() {
    try {
      setLoading(true)
      await fetch("/api/work-items/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [workItemId],
          urgent: true,
        }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={markUrgent}
        disabled={loading}
        className="rounded border px-3 py-1.5 text-sm"
      >
        Mark urgent
      </button>
    </div>
  )
}
