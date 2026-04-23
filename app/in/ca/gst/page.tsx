"use client"
import { useState, useEffect, useTransition } from "react"

type GSTFiling = {
  id: string
  clientId: string
  return_type: string
  period: string
  due_date: string
  filed_date: string | null
  status: string
  tax_liability: number | null
  late_fee: number
  notes: string | null
  assigned_to: string | null
  ca_clients?: { name: string; gstin: string | null }
}

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  filed:       "bg-green-50 text-green-700 border-green-200",
  late_filed:  "bg-red-50 text-red-600 border-red-200",
  na:          "bg-gray-50 text-gray-400 border-gray-200",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", in_progress: "In progress",
  filed: "Filed", late_filed: "Late filed", na: "N/A",
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export default function GSTFilingsPage() {
  const [filings, setFilings]         = useState<GSTFiling[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterStatus, setStatus]     = useState("all")
  const [filterType, setType]         = useState("all")
  const [search, setSearch]           = useState("")
  const [editId, setEditId]           = useState<string | null>(null)
  const [editStatus, setEditStatus]   = useState("")
  const [editFiled, setEditFiled]     = useState("")
  const [editNotes, setEditNotes]     = useState("")
  const [isPending, startTransition]  = useTransition()

  useEffect(() => {
    fetch("/api/ca/gst")
      .then(r => r.json())
      .then(d => { setFilings(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filings.filter(f => {
    if (filterStatus !== "all" && f.status !== filterStatus) return false
    if (filterType !== "all" && f.return_type !== filterType) return false
    if (search && !f.ca_clients?.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const overdue  = filings.filter(f => f.status === "pending" && daysUntil(f.due_date) < 0).length
  const dueSoon  = filings.filter(f => f.status === "pending" && daysUntil(f.due_date) >= 0 && daysUntil(f.due_date) <= 7).length
  const filed    = filings.filter(f => f.status === "filed").length

  function startEdit(f: GSTFiling) {
    setEditId(f.id)
    setEditStatus(f.status)
    setEditFiled(f.filed_date ?? "")
    setEditNotes(f.notes ?? "")
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await fetch(`/api/ca/gst/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, filed_date: editFiled || null, notes: editNotes }),
      })
      setFilings(prev => prev.map(f =>
        f.id === id ? { ...f, status: editStatus, filed_date: editFiled || null, notes: editNotes } : f
      ))
      setEditId(null)
    })
  }

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">GST filings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Client-wise GSTR-1, 3B, 9 tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",    value: filings.length,  color: "text-gray-900" },
          { label: "Overdue",  value: overdue,          color: overdue > 0 ? "text-red-600" : "text-gray-900" },
          { label: "Due in 7d",value: dueSoon,          color: dueSoon > 0 ? "text-amber-600" : "text-gray-900" },
          { label: "Filed",    value: filed,            color: "text-green-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-gray-400"
        />
        <select
          value={filterStatus}
          onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="filed">Filed</option>
          <option value="late_filed">Late filed</option>
        </select>
        <select
          value={filterType}
          onChange={e => setType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
        >
          <option value="all">All return types</option>
          <option value="GSTR-1">GSTR-1</option>
          <option value="GSTR-3B">GSTR-3B</option>
          <option value="GSTR-9">GSTR-9</option>
          <option value="GSTR-9C">GSTR-9C</option>
        </select>
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Client","GSTIN","Return","Period","Due date","Status","Tax liability",""].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-400 text-sm py-12">No filings found</td></tr>
            ) : filtered.map(f => {
              const days = daysUntil(f.due_date)
              const isEdit = editId === f.id
              return (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.ca_clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{f.ca_clients?.gstin ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">{f.return_type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.period}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">
                      {new Date(f.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                    {f.status === "pending" && (
                      <div className={`text-xs mt-0.5 ${days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLES[f.status]}`}>
                        {STATUS_LABELS[f.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right">
                    {f.tax_liability != null ? `₹${f.tax_liability.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={editFiled}
                          onChange={e => setEditFiled(e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => saveEdit(f.id)}
                          disabled={isPending}
                          className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          Save
                        </button>
                        <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(f)}
                        className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && filings.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm mb-2">No GST filings yet</p>
          <p className="text-xs">Add clients first, then generate filings for the period</p>
        </div>
      )}
    </div>
  )
}
