"use client"

import { useEffect, useMemo, useState } from "react"

type User = {
  id: string
  name: string | null
  email: string | null
}

type Followup = {
  id: string
  title: string
  owner: string | null
  dueDate: string | null
  priority: "LOW" | "MEDIUM" | "HIGH"
  blockers: string | null
  assigneeId: string | null
  matchedUser: User | null
  ownerMatchConfidence: "high" | "medium" | "none"
}

export function WorkItemFollowups({ workItemId }: { workItemId: string }) {
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [items, setItems] = useState<Followup[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users/list", { cache: "no-store" })
        const data = await res.json()
        const nextUsers = Array.isArray(data.users) ? data.users : []
        setUsers(nextUsers)
        if (nextUsers.length > 0) {
          setCurrentUserId(nextUsers[0].id)
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadUsers()
  }, [])

  const unmatchedCount = useMemo(
    () => items.filter((item) => !item.assigneeId).length,
    [items]
  )

  async function run() {
    try {
      setLoading(true)
      setMessage(null)

      const res = await fetch("/api/ai/followups/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workItemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to generate follow-up actions.")
        return
      }

      setItems(Array.isArray(data.followups) ? data.followups : [])
    } catch (error) {
      console.error(error)
      setMessage("Failed to generate follow-up actions.")
    } finally {
      setLoading(false)
    }
  }

  function setAssignToMe(followupId: string) {
    if (!currentUserId) return

    setItems((prev) =>
      prev.map((item) =>
        item.id === followupId
          ? {
              ...item,
              assigneeId: currentUserId,
            }
          : item
      )
    )
  }

  function setAssignToUser(followupId: string, userId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === followupId
          ? {
              ...item,
              assigneeId: userId || null,
            }
          : item
      )
    )
  }

  async function createAll() {
    try {
      setCreating(true)
      setMessage(null)

      const assignments = Object.fromEntries(
        items.map((item) => [item.id, item.assigneeId || null])
      )

      const res = await fetch("/api/ai/followups/create-from-work-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workItemId, assignments }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "Failed to create follow-up tasks.")
        return
      }

      setMessage(`Created ${data.count || 0} follow-up task${data.count === 1 ? "" : "s"}.`)
    } catch (error) {
      console.error(error)
      setMessage("Failed to create follow-up tasks.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="text-sm font-medium">AI Follow-up Actions</div>
          {items.length > 0 ? (
            <div className="text-xs text-gray-500">
              {unmatchedCount > 0
                ? `${unmatchedCount} follow-up action${unmatchedCount === 1 ? "" : "s"} still unassigned`
                : "All follow-up actions have an assignee"}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="rounded border px-2 py-1 text-xs"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email || user.id}
              </option>
            ))}
          </select>

          <button
            onClick={run}
            className="rounded border px-2 py-1 text-xs"
            type="button"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <button
            onClick={createAll}
            className="rounded border px-2 py-1 text-xs"
            type="button"
          >
            {creating ? "Creating..." : "Create all tasks"}
          </button>
        </div>
      </div>

      {message ? <div className="text-xs text-gray-500">{message}</div> : null}

      {items.length === 0 ? (
        <div className="text-xs text-gray-500">
          Generate follow-up actions, auto-match owners, then assign any unmatched items before creating tasks.
        </div>
      ) : null}

      {items.map((f) => (
        <div key={f.id} className="rounded border p-3 text-xs space-y-2">
          <div className="font-medium">{f.title}</div>

          <div className="text-gray-500">
            {f.priority} • suggested owner: {f.owner || "none"} • {f.dueDate || "no due date"}
          </div>

          <div className="text-gray-500">
            matched: {f.matchedUser ? (f.matchedUser.name || f.matchedUser.email || f.matchedUser.id) : "no match"} • confidence: {f.ownerMatchConfidence}
          </div>

          {f.blockers ? <div className="text-red-500">Blocker: {f.blockers}</div> : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAssignToMe(f.id)}
              className="rounded border px-2 py-1"
            >
              Assign to me
            </button>

            <select
              value={f.assigneeId || ""}
              onChange={(e) => setAssignToUser(f.id, e.target.value)}
              className="rounded border px-2 py-1"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email || user.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}
