"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast"

type ClientOption = {
  id: string
  name: string
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const
const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const

export default function NewWorkItemForm({ clients }: { clients: ClientOption[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<{ title?: string; clientId?: string }>({})
  const [form, setForm] = useState({
    title: "",
    description: "",
    filingType: "",
    periodLabel: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "PENDING",
    clientId: clients[0]?.id ?? "",
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const nextErrors: { title?: string; clientId?: string } = {}

    if (!form.title.trim()) {
      nextErrors.title = "Title is required"
    }

    if (!form.clientId) {
      nextErrors.clientId = "Client is required"
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      showToast("Please fix the form errors", "error")
      return
    }

    const res = await fetch("/api/work-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        filingType: form.filingType || null,
        periodLabel: form.periodLabel || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        priority: form.priority,
        status: form.status,
        clientId: form.clientId,
      }),
    })

    if (!res.ok) {
      showToast("Failed to create work item", "error")
      return
    }

    const item = await res.json()
    showToast("Work item created")

    startTransition(() => {
      router.push(`/work-items/${item.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-white p-6">
      <div>
        <label className="mb-1 block text-sm text-gray-500">Title</label>
        <input
          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          disabled={isPending}
          required
        />
        {errors.title ? (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-500">Description</label>
        <textarea
          className="min-h-[120px] w-full rounded-md border bg-white px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          disabled={isPending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-500">Client</label>
          <select
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            value={form.clientId}
            onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
            disabled={isPending}
            required
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId ? (
            <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-500">Status</label>
          <select
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            disabled={isPending}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-500">Filing type</label>
          <input
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            value={form.filingType}
            onChange={(e) => setForm((prev) => ({ ...prev, filingType: e.target.value }))}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-500">Period label</label>
          <input
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            value={form.periodLabel}
            onChange={(e) => setForm((prev) => ({ ...prev, periodLabel: e.target.value }))}
            disabled={isPending}
          />
        </div>

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
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !form.clientId}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create work item"}
        </button>
      </div>
    </form>
  )
}
