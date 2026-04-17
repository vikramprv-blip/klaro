"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Notification = {
  id: string
  title: string
  body: string | null
  read: boolean
  createdAt: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  async function load() {
    const res = await fetch(`/api/notifications?userId=${userId}`, {
      cache: "no-store",
    })
    const data = await res.json()
    setNotifications(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000) // poll every 10s
    return () => clearInterval(interval)
  }, [userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Link
      href={`/notifications?userId=${userId}`}
      className="relative inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium"
    >
      <span>Notifications</span>
      {unreadCount > 0 && (
        <span className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-black px-1.5 py-0.5 text-xs text-white">
          {unreadCount}
        </span>
      )}
    </Link>
  )
}
