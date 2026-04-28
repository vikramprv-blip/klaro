"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}
function timeAgo(ts: string) {
  if (!ts) return "—"
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (d < 1) return "just now"
  if (d < 60) return `${d}m ago`
  if (d < 1440) return `${Math.floor(d/60)}h ago`
  return `${Math.floor(d/1440)}d ago`
}

export default function USAppDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  async function load() {
    const r = await fetch("/api/us/dashboard").then(r => r.json()).catch(() => null)
    if (r) { setData(r); setLastRefresh(new Date()) }
    setLoading(false)
  }

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i) }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  )

  const kpi = data?.kpi || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Klaro US — Practice Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              {" · "}Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/us/sentinel" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Klaro Sentinel
            </Link>
            <button onClick={load} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-100">↻</button>
          </div>
        </div>

        {/* Sentinel Health Score */}
        {kpi.firmHealthScore > 0 && (
          <div className={`rounded-xl px-5 py-3 flex items-center justify-between border ${kpi.firmHealthScore >= 80 ? "bg-green-50 border-green-200" : kpi.firmHealthScore >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${kpi.firmHealthScore >= 80 ? "text-green-700" : kpi.firmHealthScore >= 60 ? "text-amber-700" : "text-red-700"}`}>{kpi.firmHealthScore}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Klaro Sentinel Health Score</p>
                <p className="text-xs text-gray-500">{kpi.firmHealthScore >= 80 ? "Your firm is operating well" : kpi.firmHealthScore >= 60 ? "Some matters need attention" : "Immediate action required on critical matters"}</p>
              </div>
            </div>
            <Link href="/us/sentinel" className="text-xs px-3 py-1.5 border rounded-lg hover:bg-white text-gray-600">View Sentinel →</Link>
          </div>
        )}

        {/* Escalated Blocker Alert */}
        {kpi.escalatedBlockers > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-600 text-lg">🚨</span>
              <p className="text-sm font-semibold text-red-800">{kpi.escalatedBlockers} blocker{kpi.escalatedBlockers > 1 ? "s have" : " has"} been active for 3+ days — escalation required</p>
            </div>
            <Link href="/us/blockers" className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">View Blockers →</Link>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Matters", value: kpi.activeMatters || 0, sub: `${kpi.totalMatters || 0} total`, href: "/us/matters", color: "border-blue-200 bg-blue-50 text-blue-900" },
            { label: "Revenue This Month", value: fmt(kpi.revenueThisMonth), sub: `${kpi.hoursThisMonth || 0}h billed`, href: "/us/matters", color: "border-green-200 bg-green-50 text-green-900" },
            { label: "Upcoming Deadlines", value: kpi.upcomingDeadlines || 0, sub: "next 7 days", href: "/us/matters", color: kpi.upcomingDeadlines > 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-gray-200 bg-gray-50 text-gray-900" },
            { label: "Active Blockers", value: kpi.activeBlockers || 0, sub: `${kpi.escalatedBlockers || 0} escalated`, href: "/us/blockers", color: kpi.escalatedBlockers > 0 ? "border-red-200 bg-red-50 text-red-900" : "border-gray-200 bg-gray-50 text-gray-900" },
          ].map(c => (
            <Link key={c.label} href={c.href} className={`${c.color} border rounded-xl p-4 hover:shadow-sm transition-shadow`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "New Matter", href: "/us/matters?new=1", icon: "⚖" },
            { label: "Log Time", href: "/us/matters?time=1", icon: "⏱" },
            { label: "Add Blocker", href: "/us/blockers?new=1", icon: "🚧" },
            { label: "View Sentinel", href: "/us/sentinel", icon: "🤖" },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-400 hover:shadow-sm transition-all">
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Overdue Tasks */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Overdue Tasks</h2>
              <Link href="/us/matters" className="text-xs text-blue-500 hover:underline">View all</Link>
            </div>
            {(!data?.overdueTasks?.length) ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No overdue tasks ✓</p>
            ) : data.overdueTasks.map((t: any) => (
              <div key={t.id} className="px-4 py-3 border-b last:border-0">
                <p className="text-sm font-medium text-red-700">{t.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.us_matters?.client_name} · Due {t.due_date}</p>
              </div>
            ))}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Deadlines (7 days)</h2>
              <Link href="/us/matters" className="text-xs text-blue-500 hover:underline">View all</Link>
            </div>
            {(!data?.upcomingDeadlines?.length) ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No upcoming deadlines ✓</p>
            ) : data.upcomingDeadlines.map((m: any) => {
              const days = Math.ceil((new Date(m.filing_deadline).getTime() - Date.now()) / 86400000);
              return (
                <div key={m.id} className="px-4 py-3 border-b last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.client_name}</p>
                      <p className="text-xs text-gray-500">{m.title}</p>
                    </div>
                    <span className={`text-xs font-bold ${days <= 2 ? "text-red-600" : days <= 5 ? "text-amber-600" : "text-gray-500"}`}>{days}d</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
            </div>
            <div className="divide-y">
              {(!data?.recentActivity?.length) ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">No recent activity</p>
              ) : data.recentActivity.map((a: any, i: number) => (
                <div key={i} className="px-4 py-3 flex items-start gap-2">
                  <span className="text-base flex-shrink-0">{a.type === "matter" ? "⚖" : a.type === "time" ? "⏱" : "•"}</span>
                  <div>
                    <p className="text-xs text-gray-700">{a.text}</p>
                    <p className="text-xs text-gray-400">{timeAgo(a.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentinel Alerts */}
        {data?.sentinelAlerts?.filter(Boolean).length > 0 && (
          <div className="bg-gray-900 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">Klaro Sentinel AI Insights</h2>
            </div>
            <div className="space-y-2">
              {data.sentinelAlerts.filter(Boolean).map((alert: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <p>{alert}</p>
                </div>
              ))}
            </div>
            <Link href="/us/sentinel" className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300">View full Sentinel dashboard →</Link>
          </div>
        )}

        {/* Empty state */}
        {kpi.totalMatters === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">⚖</p>
            <p className="text-lg font-semibold text-gray-900 mb-2">Welcome to Klaro US</p>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Your practice dashboard is ready. Start by adding your first matter, then invite your team and partner firms.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/us/matters?new=1" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700">Add your first matter →</Link>
              <Link href="/us/sentinel" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">View Sentinel AI</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
