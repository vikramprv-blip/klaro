import { getCADashboardStats, getUpcomingDeadlines } from "@/lib/ca-actions"
import Link from "next/link"

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

function urgencyColor(days: number) {
  if (days < 0)  return "text-red-600 bg-red-50"
  if (days <= 3) return "text-red-500 bg-red-50"
  if (days <= 7) return "text-amber-600 bg-amber-50"
  return "text-green-700 bg-green-50"
}

const MODULE_CARDS = [
  { label: "GST filings",    href: "/in/ca/gst",         desc: "GSTR-1, 3B, 9 tracking",       color: "bg-blue-50   text-blue-800"   },
  { label: "TDS compliance", href: "/in/ca/tds",         desc: "24Q, 26Q, Form 16/16A",         color: "bg-purple-50 text-purple-800" },
  { label: "ITR tracker",    href: "/in/ca/itr",         desc: "ITR-1 to ITR-7, AY 2026-27",   color: "bg-teal-50   text-teal-800"   },
  { label: "Advance tax",    href: "/in/ca/advance-tax", desc: "4 instalment tracking",          color: "bg-amber-50  text-amber-800"  },
  { label: "Clients",        href: "/in/ca/clients",     desc: "Client master, PAN, GSTIN",     color: "bg-gray-50   text-gray-800"   },
  { label: "Deadlines",      href: "/in/ca/deadlines",   desc: "Full compliance calendar",       color: "bg-rose-50   text-rose-800"   },
]

export default async function CAOverviewPage() {
  const [stats, deadlines] = await Promise.all([
    getCADashboardStats(),
    getUpcomingDeadlines(14),
  ])

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">CA Suite</h1>
        <p className="text-sm text-gray-500 mt-1">Practice management for chartered accountants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active clients",  value: stats.totalClients, color: "text-gray-900" },
          { label: "GST filings due", value: stats.gstPending,   color: "text-amber-600" },
          { label: "Overdue filings", value: stats.gstOverdue,   color: stats.gstOverdue > 0 ? "text-red-600" : "text-gray-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs text-gray-400 mb-2">{label}</p>
            <p className={`text-3xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Module cards */}
        <div className="col-span-2">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Modules</h2>
          <div className="grid grid-cols-2 gap-3">
            {MODULE_CARDS.map(({ label, href, desc, color }) => (
              <Link
                key={href}
                href={href}
                className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${color}`}>{label}</span>
                <p className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Next 14 days</h2>
          {deadlines.length === 0 ? (
            <p className="text-sm text-gray-400">No deadlines in next 14 days</p>
          ) : (
            <div className="flex flex-col gap-2">
              {deadlines.slice(0, 8).map((d) => {
                const days = daysUntil(d.due_date)
                return (
                  <div key={d.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-700 font-medium leading-snug">{d.description}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400">
                        {new Date(d.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${urgencyColor(days)}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d`}
                      </span>
                    </div>
                  </div>
                )
              })}
              {deadlines.length > 8 && (
                <Link href="/in/ca/deadlines" className="text-xs text-blue-500 hover:underline text-center py-1">
                  +{deadlines.length - 8} more →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
