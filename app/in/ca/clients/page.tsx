"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

type Client = {
  id: string; name: string; email: string | null;
  gstin: string | null; pan: string | null;
  entity_type: string | null; city: string | null;
  status: string | null; services: string[] | null;
}

export default function CAClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/ca/clients", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.gstin || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.pan || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-8 text-gray-400">Loading clients...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""} in your firm</p>
        </div>
        <div className="flex gap-2">
          <Link href="/in/ca/bulk-import"
            className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
            Bulk Import
          </Link>
          <Link href="/in/ca/clients/new"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">
            + Add Client
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <input className="w-full border rounded-lg px-4 py-2 text-sm"
          placeholder="Search by name, GSTIN, PAN or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center">
          <p className="text-3xl mb-3">👤</p>
          <p className="text-sm text-gray-500 mb-4">{search ? "No clients match your search" : "No clients yet"}</p>
          {!search && (
            <Link href="/in/ca/clients/new"
              className="inline-flex bg-gray-900 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-700">
              Add your first client
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <tr>{["Client", "Contact", "GSTIN / PAN", "Type", "Services", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.city && <p className="text-xs text-gray-400">{c.city}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <p>{c.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    <p>{c.gstin || "—"}</p>
                    <p className="text-gray-400">{c.pan || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.entity_type || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.services || []).slice(0, 2).map((s: string) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {(c.services || []).length > 2 && <span className="text-xs text-gray-400">+{(c.services||[]).length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/in/ca/clients/${c.id}`}
                      className="text-xs text-blue-500 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
