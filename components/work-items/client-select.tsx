"use client"

import { useEffect, useState } from "react"

type Client = {
  id: string
  name: string
}

export function ClientSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadClients() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("/api/clients", {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("Failed to load clients")
        }

        const data = await res.json()
        if (!active) return

        setClients(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Failed to load clients")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadClients()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
        disabled={loading}
      >
        <option value="">
          {loading ? "Loading clients..." : "Select client"}
        </option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {!loading && clients.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No clients found. Create a client first.
        </p>
      ) : null}
    </div>
  )
}
