"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const

type Props = {
  id: string
  value: string
}

export default function WorkItemStatusForm({ id, value }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  async function onChange(nextStatus: string) {
    const res = await fetch(`/api/work-items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    })

    if (!res.ok) {
      showToast("Failed to update status", "error")
      return
    }

    showToast("Status updated")

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-500">Status</label>
      <select
        className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        defaultValue={value}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  )
}
