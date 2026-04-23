"use client"

import { useEffect, useState } from "react"

type UserOption = {
  id: string
  name: string | null
  email?: string | null
}

export function WorkItemAssigneeForm({
  workItemId,
  assigneeId,
}: {
  workItemId: string
  assigneeId?: string | null
}) {
  const [users, setUsers] = useState<UserOption[]>([])
  const [value, setValue] = useState(assigneeId || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/users/list", { cache: "no-store" })
      const data = await res.json()
      setUsers(Array.isArray(data.users) ? data.users : [])
    }
    load()
  }, [])

  async function onChange(nextValue: string) {
    setValue(nextValue)
    setSaving(true)

    try {
      const res = await fetch("/api/work-items/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: [workItemId],
          assigneeId: nextValue || null,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update assignee")
      }
    } catch (error) {
      console.error(error)
      alert("Failed to update assignee")
      setValue(assigneeId || "")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500">Assignee</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
        disabled={saving}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name || user.email || user.id}
          </option>
        ))}
      </select>
    </div>
  )
}
