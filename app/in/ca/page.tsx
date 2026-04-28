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
  invoice: "₹", client: "👤", timesheet: "⏱", esign: "✍", followup: "📞", filing: "📋"
}

export default function CADashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  async function load() {
    const r = await fetch("/api/ca/dashboard").then(r => r.json()).catch(() => null)
    if (r) { setData(r); setLastRefresh(new Date()) }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000) // auto-refresh every 60s
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="text-3xl mb-3 animate-pulse">📊</div>
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

  const { kpi, alerts, activity, timesheetByEmployee, filingStats, upcomingDeadlines, overdueDeadlines, recentInvoices, dscExpiring } = data

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CA Suite — Practice Overview</h1>
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
          { label: "Total Clients", value: kpi.totalClients, sub: `+${kpi.newClientsThisMonth} this month`, href: "/in/ca/clients", color: "border-blue-200 bg-blue-50", text: "text-blue-900" },
          { label: "Invoices Collected", value: fmt(kpi.invoicePaid), sub: `${kpi.invoiceOverdue} overdue`, href: "/in/ca/invoices", color: "border-green-200 bg-green-50", text: "text-green-900" },
          { label: "Hours This Month", value: `${kpi.totalHoursThisMonth.toFixed(1)}h`, sub: `${fmt(kpi.unbilledAmount)} unbilled`, href: "/in/ca/hr/timesheets", color: "border-purple-200 bg-purple-50", text: "text-purple-900" },
          { label: "Employees", value: kpi.totalEmployees, sub: `${kpi.payrollPending} payroll pending`, href: "/in/ca/hr", color: "border-gray-200 bg-gray-50", text: "text-gray-900" },
        ].map(c => (
          <Link key={c.label} href={c.href}
            className={`${c.color} border rounded-xl p-4 hover:shadow-sm transition-shadow`}>
            <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* FILING STATUS */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Filing Status</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(filingStats || {}).map(([key, stats]: any) => (
            <Link key={key} href={`/in/ca/${key}`} className="space-y-2 hover:opacity-80">
              <p className="text-xs font-semibold text-gray-500 uppercase">{key.toUpperCase()}</p>
              <div className="flex gap-2 text-sm">
                <span className="text-green-700 font-semibold">✓ {stats.filed}</span>
                <span className="text-amber-600">⏳ {stats.pending}</span>
                {stats.overdue > 0 && <span className="text-red-600 font-bold">⚠ {stats.overdue}</span>}
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                {(stats.filed + stats.pending) > 0 && (
                  <div className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.round(stats.filed / (stats.filed + stats.pending) * 100)}%` }} />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {stats.filed + stats.pending > 0
                  ? `${Math.round(stats.filed / (stats.filed + stats.pending) * 100)}% complete`
                  : "No records"}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* TEAM TIMESHEETS */}
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Team Timesheets</h2>
            <Link href="/in/ca/hr/timesheets" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {timesheetByEmployee?.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">No employees yet</p>}
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

        {/* UPCOMING DEADLINES */}
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Deadlines (7 days)</h2>
            <Link href="/in/ca/deadlines" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {upcomingDeadlines?.length === 0 && overdueDeadlines?.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">No upcoming deadlines</p>
          )}
          {overdueDeadlines?.map((d: any) => (
            <div key={d.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-red-700 truncate">{d.title} — {d.client_name || "All clients"}</p>
                <p className="text-xs text-red-500">Overdue: {d.due_date}</p>
              </div>
            </div>
          ))}
          {upcomingDeadlines?.map((d: any) => (
            <div key={d.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{d.title} — {d.client_name || "All clients"}</p>
                <p className="text-xs text-gray-400">Due: {d.due_date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DSC EXPIRING */}
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">DSC Expiring</h2>
            <Link href="/in/ca/dsc" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          {dscExpiring?.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">No DSCs expiring soon</p>}
          {dscExpiring?.map((d: any) => {
            const days = Math.ceil((new Date(d.expiry_date).getTime() - Date.now()) / 86400000)
            return (
              <div key={d.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${days <= 7 ? "bg-red-500" : "bg-amber-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{d.client_name}</p>
                  <p className="text-xs text-gray-400">{d.holder_name}</p>
                </div>
                <span className={`text-xs font-bold ${days <= 7 ? "text-red-600" : "text-amber-600"}`}>{days}d</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* RECENT INVOICES */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Invoices</h2>
            <Link href="/in/ca/invoices" className="text-xs text-blue-500 hover:underline">View all</Link>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase border-b">
              <tr>{["Invoice", "Client", "Amount", "Status"].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {recentInvoices?.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No invoices yet</td></tr>}
              {recentInvoices?.map((inv: any) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-blue-700">{inv.invoice_number}</td>
                  <td className="px-3 py-2 text-gray-700 truncate max-w-24">{inv.ca_clients?.name || "—"}</td>
                  <td className="px-3 py-2 font-semibold">{fmt(inv.total_amount)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${inv.status === "paid" ? "bg-green-50 text-green-700" : inv.status === "overdue" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  )
}
