"use client"

import { useEffect, useState } from "react"

export type FilterUser = {
  id: string
  name: string | null
  email: string | null
}

export function useUsers() {
  const [users, setUsers] = useState<FilterUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadUsers() {
      try {
        const res = await fetch("/api/users", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (active) setUsers(data)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [])

  return { users, loading }
}
