"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function LawyerDashboard() {
  const [stats, setStats] = useState({ matters: 0, hearings: 0, tasks: 0, actions: 0, thisWeek: 0, evidence: 0 })
  const [actions, setActions] = useState<any[]>([])
  const [hearings, setHearings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [ar, hr] = await Promise.all([
        fetch("/api/lawyer/actions").then(r => r.json()),
        fetch("/api/lawyer/hearings").then(r => r.json()),
      ])
      const acts = ar.actions || []
      const hrs = Array.isArray(hr) ? hr : []
      const today = new Date().toISOString().split("T")[0]
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
      const thisWeek = hrs.filter((h: any) => h.hearing_date >= today && h.hearing_date <= nextWeek).length
      setActions(acts.slice(0, 5))
      setHearings(hrs.filter((h: any) => h.hearing_date >= today).slice(0, 5))
      setStats(s => ({ ...s, actions: acts.length, hearings: hrs.length, thisWeek }))
      setLoading(false)
    }
    load()
  }, [])

  const QUICK_LINKS = [
    { label: "New Matter", href: "/in/lawyer/matters", icon: "◉", color: "bg-blue-50 text-blue-700" },
    { label: "Add Hearing", href: "/in/lawyer/hearings", icon: "◷", color: "bg-purple-50 text-purple-700" },
    { label: "Upload Evidence", href: "/in/lawyer/evidence", icon: "▣", color: "bg-green-50 text-green-700" },
    { label: "Generate Notice", href: "/in/lawyer/notices", icon: "!", color: "bg-amber-50 text-amber-700" },
    { label: "Vakalatnama", href: "/in/lawyer/vakalatnama", icon: "V", color: "bg-red-50 text-red-700" },
    { label: "Court Fees", href: "/in/lawyer/court-fee", icon: "₹", color: "bg-gray-100 text-gray-700" },
    { label: "Time Billing", href: "/in/lawyer/time-billing", icon: "⏱", color: "bg-teal-50 text-teal-700" },
    { label: "Research", href: "/in/lawyer/research", icon: "◎", color: "bg-indigo-50 text-indigo-700" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lawyer Suite</h1>
        <p className="text-sm text-gray-500 mt-1">Your practice overview — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {[
          { label: "Pending Actions", value: stats.actions, href: "/in/lawyer", color: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "Hearings", value: stats.hearings, href: "/in/lawyer/hearings", color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "This Week", value: stats.thisWeek, href: "/in/lawyer/hearings", color: "bg-red-50 text-red-700 border-red-100" },
          { label: "Matters", value: "—", href: "/in/lawyer/matters", color: "bg-purple-50 text-purple-700 border-purple-100" },
          { label: "Evidence Files", value: "—", href: "/in/lawyer/evidence", color: "bg-green-50 text-green-700 border-green-100" },
          { label: "Tasks", value: "—", href: "/in/lawyer/tasks", color: "bg-gray-100 text-gray-700 border-gray-200" },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className={`${s.color} border rounded-xl p-4 hover:opacity-80 transition-opacity`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Action alerts */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">⚡ Pending Actions</h2>
              <Link href="/in/lawyer/hearings" className="text-xs text-blue-500 hover:underline">View all →</Link>
            </div>
            {actions.length === 0 && !loading && <p className="px-4 py-6 text-center text-gray-400 text-sm">No pending actions — you're all caught up!</p>}
            {actions.map((a: any) => (
              <div key={a.id} className="px-4 py-3 border-b last:border-0 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.description?.slice(0, 80)}</p>
                  {a.due_date && <p className="text-xs text-amber-600 mt-0.5 font-medium">Due: {a.due_date}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${
                  a.priority === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                }`}>{a.priority}</span>
              </div>
            ))}
          </div>

          {/* Upcoming hearings */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">🏛️ Upcoming Hearings</h2>
              <Link href="/in/lawyer/hearings" className="text-xs text-blue-500 hover:underline">View all →</Link>
            </div>
            {hearings.length === 0 && !loading && <p className="px-4 py-6 text-center text-gray-400 text-sm">No upcoming hearings</p>}
            {hearings.map((h: any) => {
              const days = Math.ceil((new Date(h.hearing_date).getTime() - Date.now()) / 86400000)
              return (
                <div key={h.id} className="px-4 py-3 border-b last:border-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.legal_matters?.client_name || "—"}</p>
                    <p className="text-xs text-gray-500">{h.court_name || h.court} · {h.purpose || "Hearing"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{h.hearing_date}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${days <= 3 ? "bg-red-50 text-red-700" : days <= 7 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map(l => (
                <Link key={l.label} href={l.href}
                  className={`${l.color} rounded-lg p-2.5 text-center hover:opacity-80 transition-opacity`}>
                  <p className="text-lg font-mono mb-1">{l.icon}</p>
                  <p className="text-xs font-medium leading-tight">{l.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Resources</h2>
            {[
              { label: "Indian Kanoon", url: "https://indiankanoon.org", desc: "Free case law search" },
              { label: "eCourts Portal", url: "https://ecourts.gov.in", desc: "Case status + cause lists" },
              { label: "Supreme Court", url: "https://main.sci.gov.in", desc: "SC judgment database" },
            ].map(r => (
              <a key={r.label} href={r.url} target="_blank"
                className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                <div>
                  <p className="text-xs font-medium text-gray-900">{r.label} ↗</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
