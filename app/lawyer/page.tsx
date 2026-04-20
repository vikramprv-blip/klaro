// ── app/lawyer/page.tsx (Overview) ───────────────────────────────────────────
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function LawyerOverviewPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/lawyer/stats").then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const MODULES = [
    { label: "Matters",   href: "/lawyer/matters",   color: "bg-gray-50 text-gray-800",    stat: `${stats?.activeMatters ?? 0} active` },
    { label: "Hearings",  href: "/lawyer/hearings",  color: "bg-blue-50 text-blue-800",    stat: `${stats?.hearingsThisWeek ?? 0} this week` },
    { label: "Tasks",     href: "/lawyer/tasks",     color: "bg-amber-50 text-amber-800",  stat: `${stats?.pendingTasks ?? 0} pending` },
    { label: "Drafts",    href: "/lawyer/drafts",    color: "bg-purple-50 text-purple-800",stat: "AI drafting" },
    { label: "Documents", href: "/lawyer/documents", color: "bg-teal-50 text-teal-800",    stat: "Document vault" },
    { label: "Billing",   href: "/lawyer/billing",   color: "bg-green-50 text-green-800",  stat: "Time & fees" },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Lawyer Suite</h1>
        <p className="text-sm text-gray-400 mt-1">Case and practice management</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active matters",    value: stats?.activeMatters ?? 0,    color: "text-gray-900" },
            { label: "Urgent",            value: stats?.urgentMatters ?? 0,    color: (stats?.urgentMatters ?? 0) > 0 ? "text-red-600" : "text-gray-900" },
            { label: "Hearings this week",value: stats?.hearingsThisWeek ?? 0, color: (stats?.hearingsThisWeek ?? 0) > 0 ? "text-amber-600" : "text-gray-900" },
            { label: "Overdue tasks",     value: stats?.overdueTasks ?? 0,     color: (stats?.overdueTasks ?? 0) > 0 ? "text-red-600" : "text-gray-900" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-2">{label}</p>
              <p className={`text-3xl font-medium ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(({ label, href, color, stat }) => (
          <Link key={href} href={href} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${color}`}>{label}</span>
            <p className="text-xs text-gray-400 mt-2">{loading ? "..." : stat}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
