"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export function QuickAddTask({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName ?? ""
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable === true

      if (isTyping) return

      if (e.key.toLowerCase() === "c") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  async function createTask() {
    const cleanTitle = title.trim()
    if (!cleanTitle || loading) return

    setLoading(true)

    try {
      const res = await fetch("/api/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          status: "PENDING",
          priority: "MEDIUM",
        }),
      })

      if (!res.ok) {
        toast.error("Failed to create task")
        return
      }

      setTitle("")
      toast.success("Task created")
      onCreated?.()
      inputRef.current?.focus()
    } catch {
      toast.error("Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 border-b p-2">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") createTask()
          if (e.key === "Escape") {
            setTitle("")
            inputRef.current?.blur()
          }
        }}
        placeholder="Press C to focus, Enter to add task…"
        className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={createTask}
        disabled={loading}
        className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        Add
      </button>
    </div>
  )
}
