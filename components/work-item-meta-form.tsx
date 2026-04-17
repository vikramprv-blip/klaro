"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

type Props = {
  id: string
  dueDate: string
  priority: string
}

export default function WorkItemMetaForm({ id, dueDate, priority }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    dueDate,
    priority,
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const res = await fetch(`/api/work-items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        priority: form.priority,
      }),
    })

    if (!res.ok) {
      showToast("Failed to save due date / priority", "error")
      return
    }

    showToast("Meta updated")

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-500">Due date</label>
        <input
          type="date"
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
          value={form.dueDate}
          onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
          disabled={isPending}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-500">Priority</label>
        <select
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
          value={form.priority}
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
          disabled={isPending}
        >
          {PRIORITIES.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save meta"}
        </button>
      </div>
    </form>
  )
}
