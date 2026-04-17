"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

type UserOption = {
  id: string
  name: string | null
  email: string
}

type Props = {
  id: string
  value: string
  users: UserOption[]
}

export default function WorkItemAssigneeForm({ id, value, users }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  async function onChange(userId: string) {
    const res = await fetch(`/api/work-items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assigneeId: userId,
      }),
    })

    if (!res.ok) {
      showToast("Failed to update assignee", "error")
      return
    }

    showToast("Assignee updated")

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-500">Assignee</label>
      <select
        className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        defaultValue={value}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name ?? user.email}
          </option>
        ))}
      </select>
    </div>
  )
}
