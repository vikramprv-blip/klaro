"use client"
import { useState, useEffect } from "react"

type Deadline = {
  id: string
  deadline_type: string
  title: string
  description: string
  due_date: string
  applicable_to: string[]
  penalty_info: string | null
  financial_year: string | null
  status: string
}

const TYPE_STYLES: Record<string, string> = {
  gst:          "bg-blue-50 text-blue-700",
  tds:          "bg-purple-50 text-purple-700",
  itr:          "bg-teal-50 text-teal-700",
  advance_tax:  "bg-amber-50 text-amber-700",
  roc:          "bg-pink-50 text-pink-700",
  audit:        "bg-orange-50 text-orange-700",
  mca:          "bg-indigo-50 text-indigo-700",
  other:        "bg-gray-50 text-gray-600",
}

const TYPE_LABELS: Record<string, string> = {
  gst: "GST", tds: "TDS", itr: "ITR", advance_tax: "Advance Tax",
  roc: "ROC", audit: "Audit", mca: "MCA", other: "Other",
}

const MONTHS = [
  "Apr 2026","May 2026","Jun 2026","Jul 2026","Aug 2026","Sep 2026",
  "Oct 2026","Nov 2026","Dec 2026","Jan 2027","Feb 2027","Mar 2027",
]

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function urgencyBadge(days: number, status: string) {
  if (status === "filed") return <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Done</span>
  if (days < 0)   return <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">{Math.abs(days)}d overdue</span>
  if (days === 0) return <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">Due today</span>
  if (days <= 7)  return <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">{days}d left</span>
  if (days <= 30) return <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">{days}d left</span>
  return <span className="text-xs text-gray-400">{new Date(new Date().getFullYear(), new Date(new Date().setDate(new Date().getDate() + days)).getMonth(), 1).toLocaleDateString()}{days}d</span>
}

export default function DeadlinesPage() {
  const [deadlines, setDeadlines]   = useState<Deadline[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterType, setType]       = useState("all")
  const [filterMonth, setMonth]     = useState("all")
  const [view, setView]             = useState<"list"|"calendar">("list")
  const [search, setSearch]         = useState("")

  useEffect(() => {
    fetch("/api/ca/deadlines")
      .then(r => r.json())
      .then(d => { setDeadlines(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = deadlines.filter(d => {
    if (filterType !== "all" && d.deadline_type !== filterType) return false
    if (filterMonth !== "all") {
      const date = new Date(d.due_date)
      const label = date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }).replace(" ", " ")
      if (!label.toLowerCase().includes(filterMonth.toLowerCase())) return false
    }
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const overdue  = deadlines.filter(d => daysUntil(d.due_date) < 0 && d.status !== "filed").length
  const thisWeek = deadlines.filter(d => { const x = daysUntil(d.due_date); return x >= 0 && x <= 7 && d.status !== "filed" }).length
  const thisMonth= deadlines.filter(d => { const x = daysUntil(d.due_date); return x >= 0 && x <= 30 && d.status !== "filed" }).length

  // Group by month for calendar view
  const byMonth: Record<string, Deadline[]> = {}
  filtered.forEach(d => {
    const key = new Date(d.due_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(d)
  })

  if (loading) return <div className="p-8 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Compliance deadlines</h1>
          <p className="text-sm text-gray-400 mt-0.5">FY 2026-27 — GST, TDS, ITR, Advance Tax, ROC</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("list")}
            className={`text-sm px-3 py-1.5 rounded-lg border ${view === "list" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            List
          </button>
          <button onClick={() => setView("calendar")}
            className={`text-sm px-3 py-1.5 rounded-lg border ${view === "calendar" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            By month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Overdue",    value: overdue,    color: overdue > 0 ? "text-red-600" : "text-gray-900" },
          { label: "This week",  value: thisWeek,   color: thisWeek > 0 ? "text-amber-600" : "text-gray-900" },
          { label: "This month", value: thisMonth,  color: "text-gray-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:border-gray-400" />
        <select value={filterType} onChange={e => setType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All types</option>
          {Object.entries(TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All months</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} deadlines</span>
      </div>

      {view === "list" ? (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Type","Deadline","Due date","Status","Penalty"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-12 text-sm">No deadlines match your filters</td></tr>
              ) : filtered.map(d => {
                const days = daysUntil(d.due_date)
                return (
                  <tr key={d.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${days < 0 && d.status !== "filed" ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_STYLES[d.deadline_type] ?? TYPE_STYLES.other}`}>
                        {TYPE_LABELS[d.deadline_type] ?? d.deadline_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{d.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(d.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">{urgencyBadge(days, d.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{d.penalty_info ?? "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byMonth).map(([month, items]) => (
            <div key={month}>
              <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                {month}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map(d => {
                  const days = daysUntil(d.due_date)
                  return (
                    <div key={d.id} className={`border rounded-lg p-3 flex items-center gap-3 ${days < 0 && d.status !== "filed" ? "border-red-100 bg-red-50/30" : "border-gray-100"}`}>
                      <div className="text-center min-w-10">
                        <p className="text-lg font-medium text-gray-800">{new Date(d.due_date).getDate()}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{d.title}</p>
                        <p className="text-xs text-gray-400">{d.penalty_info}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_STYLES[d.deadline_type] ?? TYPE_STYLES.other}`}>
                        {TYPE_LABELS[d.deadline_type] ?? d.deadline_type}
                      </span>
                      {urgencyBadge(days, d.status)}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {Object.keys(byMonth).length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">No deadlines match your filters</p>
          )}
        </div>
      )}
    </div>
  )
}
