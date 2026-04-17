"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

type Props = {
  id: string
  title: string
  description: string | null
}

export default function WorkItemEditForm({ id, title, description }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title,
    description: description ?? "",
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.title.trim()) {
      setError("Title is required")
      showToast("Please enter a title", "error")
      return
    }

    setError("")

    const res = await fetch(`/api/work-items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
      }),
    })

    if (!res.ok) {
      showToast("Failed to save changes", "error")
      return
    }

    showToast("Changes saved")

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-500">Title</label>
        <input
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          disabled={isPending}
          required
        />
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-500">Description</label>
        <textarea
          className="min-h-[140px] w-full rounded-md border bg-white px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  )
}
