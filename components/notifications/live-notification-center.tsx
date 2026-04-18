"use client"

import useSWR from "swr"
import { Bell, CheckCheck } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

type NotificationItem = {
  id: string
  title?: string | null
  message?: string | null
  body?: string | null
  content?: string | null
  createdAt?: string
  read?: boolean
  readAt?: string | null
}

const fetcher = async (url: string): Promise<NotificationItem[]> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load notifications")
  const json = await res.json()
  if (Array.isArray(json)) return json
  if (Array.isArray(json.notifications)) return json.notifications
  if (Array.isArray(json.items)) return json.items
  return []
}

function getUnread(item: NotificationItem) {
  if (typeof item.read === "boolean") return item.read === false
  if ("readAt" in item) return !item.readAt
  return false
}

function getText(item: NotificationItem) {
  return item.title || item.message || item.body || item.content || "New notification"
}

export function LiveNotificationCenter() {
  const [open, setOpen] = useState(false)
  const seenIds = useRef<Set<string>>(new Set())
  const booted = useRef(false)

  const { data = [], mutate, isLoading } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })

  const notifications = useMemo(() => data.slice(0, 12), [data])
  const unreadCount = useMemo(() => notifications.filter(getUnread).length, [notifications])

  useEffect(() => {
    const ids = notifications.map((n) => n.id)
    if (!booted.current) {
      ids.forEach((id) => seenIds.current.add(id))
      booted.current = true
      return
    }

    const fresh = notifications.filter((n) => !seenIds.current.has(n.id))
    fresh.forEach((n) => {
      seenIds.current.add(n.id)
      toast(getText(n), {
        description: n.createdAt ? new Date(n.createdAt).toLocaleString() : undefined,
      })
    })
  }, [notifications])

  async function markAllAsRead() {
    const res = await fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      toast.error("Failed to mark all as read")
      return
    }

    toast.success("All notifications marked as read")
    mutate()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:shadow md:right-6 md:top-5"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed right-4 top-16 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-white shadow-2xl md:right-6 md:top-20">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Notifications</div>
              <div className="text-xs text-gray-500">
                {unreadCount} unread
              </div>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-sm text-gray-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">No notifications yet.</div>
            ) : (
              notifications.map((item) => {
                const unread = getUnread(item)
                return (
                  <div
                    key={item.id}
                    className={`border-b px-4 py-3 last:border-b-0 ${unread ? "bg-blue-50/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{getText(item)}</div>
                        {item.createdAt ? (
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        ) : null}
                      </div>
                      {unread ? (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
