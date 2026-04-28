"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

function fmt(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`
}
function timeAgo(ts: string) {
  if (!ts) return "—"
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (d < 1) return "just now"
  if (d < 60) return `${d}m ago`
  if (d < 1440) return `${Math.floor(d/60)}h ago`
  return `${Math.floor(d/1440)}d ago`
}

const ACTIVITY_ICONS: Record<string, string> = {
  matter: "⚖", hearing: "🏛", evidence: "📁", notice: "📋", billing: "₹", timesheet: "⏱"
}

export default function LawyerDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  async function load() {
    const r = await fetch("/api/lawyer/dashboard").then(r => r.json()).catch(() => null)
    if (r) { setData(r); setLastRefresh(new Date()) }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="text-3xl mb-3 animate-pulse">⚖️</div>
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="p-8 text-center text-gray-400">
      <p>Unable to load dashboard data.</p>
      <button onClick={load} className="mt-3 px-4 py-2 border rounded-lg text-sm">Retry</button>
    </div>
  )

  const { kpi, alerts, activity, timesheetByEmployee, todayHearings, weekHearings, overdueTasks, criticalLimitations, recentMatters } = data

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lawyer Suite — Practice Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" · "}Updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button onClick={load} className="px-3 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">↻ Refresh</button>
      </div>

      {/* ALERTS */}
      {alerts?.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">⚠ Alerts & Notifications</h2>
          <div className="grid grid-cols-1 gap-2">
            {alerts.map((a: any, i: number) => (
              <Link key={i} href={a.link || "#"}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors hover:opacity-80 ${
                  a.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
                  a.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                  "bg-blue-50 border-blue-200 text-blue-800"
                }`}>
                <span className="text-base">{a.icon}</span>
                <span className="flex-1">{a.title}</span>
                {a.count > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.type === "error" ? "bg-red-200 text-red-900" : a.type === "warning" ? "bg-amber-200 text-amber-900" : "bg-blue-200 text-blue-900"}`}>{a.count}</span>}
                <span className="opacity-50">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Matters", value: kpi.activeMatters, sub: `${kpi.newMattersThisMonth} new this month`, href: "/in/lawyer/matters", color: "border-blue-200 bg-blue-50", text: "text-blue-900" },
          { label: "Today's Hearings", value: kpi.todayHearings, sub: `${kpi.weekHearings} this week`, href: "/in/lawyer/hearings", color: kpi.todayHearings > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50", text: kpi.todayHearings > 0 ? "text-amber-900" : "text-green-900" },
          { label: "Billing Collected", value: fmt(kpi.billingPaid), sub: `${kpi.billingPending} pending`, href: "/in/lawyer/billing", color: "border-green-200 bg-green-50", text: "text-green-900" },
          { label: "Hours This Month", value: `${kpi.totalHoursThisMonth.toFixed(1)}h`, sub: `${fmt(kpi.unbilledAmount)} unbilled`, href: "/in/lawyer/hr/timesheets", color: "border-purple-200 bg-purple-50", text: "text-purple-900" },
        ].map(c => (
          <Link key={c.label} href={c.href}
            className={`${c.color} border rounded-xl p-4 hover:shadow-sm transition-shadow`}>
            <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* TODAY'S HEARINGS */}
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Today's Hearings</h2>
            <Link href="/in/lawyer/hearings" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {todayHearings?.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">No hearings today ✓</p>}
          {todayHearings?.map((h: any) => (
            <div key={h.id} className="py-2 border-b last:border-0">
              <p className="text-sm font-medium text-gray-900">{h.legal_matters?.client_name || "—"}</p>
              <p className="text-xs text-gray-500">{h.court_name} · {h.purpose}</p>
            </div>
          ))}
        </div>

        {/* OVERDUE TASKS */}
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Overdue Tasks</h2>
            <Link href="/in/lawyer/tasks" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {overdueTasks?.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">No overdue tasks ✓</p>}
          {overdueTasks?.map((t: any) => (
            <div key={t.id} className="flex items-start gap-2 py-1.5 border-b last:border-0">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-medium text-red-700">{t.title}</p>
                <p className="text-xs text-gray-400">{t.legal_matters?.client_name} · Due {t.due_date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CRITICAL LIMITATIONS */}
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">⏰ Limitation Alerts</h2>
            <Link href="/in/lawyer/limitation" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {criticalLimitations?.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">No critical limitations ✓</p>}
          {criticalLimitations?.map((l: any) => {
            const days = Number(l.days_remaining)
            return (
              <div key={l.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${days < 0 ? "bg-red-600" : days <= 7 ? "bg-red-400" : "bg-amber-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{l.client_name}</p>
                  <p className="text-xs text-gray-400">{l.matter_type}</p>
                </div>
                <span className={`text-xs font-bold ${days < 0 ? "text-red-700" : "text-amber-600"}`}>
                  {days < 0 ? `${Math.abs(days)}d over` : `${days}d`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* TEAM TIMESHEETS */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Team — Hours This Month</h2>
            <Link href="/in/lawyer/hr/timesheets" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {timesheetByEmployee?.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No employees yet</p>}
          {timesheetByEmployee?.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400">{e.role} · Last: {e.lastEntry || "never"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{e.hoursThisMonth.toFixed(1)}h</p>
                <p className="text-xs text-gray-400">{e.entries} entries</p>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVITY FEED */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Activity Feed</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activity?.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>}
            {activity?.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <span className="text-base flex-shrink-0">{ACTIVITY_ICONS[a.type] || "•"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700 truncate">{a.text}</p>
                  <p className="text-xs text-gray-400">{timeAgo(a.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT MATTERS */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Matters</h2>
          <Link href="/in/lawyer/matters" className="text-xs text-blue-500 hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
            <tr>{["Client", "Matter", "Type", "Status", "Next Date"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {recentMatters?.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No matters yet</td></tr>}
            {recentMatters?.map((m: any) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.client_name}</td>
                <td className="px-4 py-3 text-gray-700 text-xs">{m.matter_title}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{m.matter_type || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${m.status === "active" ? "bg-green-50 text-green-700" : m.status === "closed" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{m.next_date || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
