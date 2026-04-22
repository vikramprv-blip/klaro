"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
    fetch("/api/clients/counts").then(r => r.json()).then(setCounts)
  }, [])

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <h1 className="text-xl font-medium text-gray-900">Clients</h1>

      <div className="space-y-3">
        {clients.length === 0 && (
          <p className="text-sm text-gray-400">No clients yet</p>
        )}

        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/in/ca/clients/${c.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.email || "-"}</p>
              </div>

              <span className="text-xs text-gray-600 border rounded-full px-2 py-1">
                {counts[c.id] || 0} docs
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
