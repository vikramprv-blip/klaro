"use client"

import { useState } from "react"
import { toast } from "sonner"

export function QuickAddTask({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  async function createTask() {
    if (!title.trim()) return

    setLoading(true)

    const res = await fetch("/api/work-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        status: "PENDING",
        priority: "MEDIUM",
      }),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error("Failed to create task")
      return
    }

    setTitle("")
    toast.success("Task created")
    onCreated?.()
  }

  return (
    <div className="flex items-center gap-2 border-b p-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") createTask()
        }}
        placeholder="Press Enter to add task…"
        className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={createTask}
        disabled={loading}
        className="rounded-md bg-black px-3 py-2 text-sm text-white"
      >
        Add
      </button>
    </div>
  )
}
