"use client"
import { useEffect, useState } from "react"

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-50 text-green-700",
  updated: "bg-blue-50 text-blue-700",
  deleted: "bg-red-50 text-red-700",
  filed: "bg-purple-50 text-purple-700",
  approved: "bg-emerald-50 text-emerald-700",
  viewed: "bg-gray-100 text-gray-600",
  exported: "bg-amber-50 text-amber-700",
}

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN");
}

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  async function load(entity_type?: string) {
    const url = entity_type ? `/api/audit?entity_type=${entity_type}` : "/api/audit"
    const r = await fetch(url).then(r => r.json())
    setLogs(r.logs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const entityTypes = [...new Set(logs.map(l => l.entity_type).filter(Boolean))]
  const filtered = filter ? logs.filter(l => l.entity_type === filter) : logs

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-sm text-gray-500 mt-1">Complete activity log — who did what and when. ICAI peer review ready.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${!filter ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}>
          All ({logs.length})
        </button>
        {entityTypes.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${filter === t ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}>
            {t} ({logs.filter(l => l.entity_type === t).length})
          </button>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Time", "User", "Action", "Entity", "Details"].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                No audit logs yet. Actions taken in the platform will appear here automatically.
              </td></tr>
            )}
            {filtered.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{timeAgo(log.created_at)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 text-xs">{log.users?.full_name || "System"}</p>
                  <p className="text-xs text-gray-400">{log.user_email || log.users?.email || ""}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-700">{log.entity_type || "—"}</p>
                  <p className="text-xs text-gray-500">{log.entity_name || ""}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-64 truncate">
                  {log.new_value ? JSON.stringify(log.new_value).slice(0, 80) + "..." : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
