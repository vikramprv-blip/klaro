"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

function HealthScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-red-400"
  const ring = score >= 80 ? "stroke-green-400" : score >= 60 ? "stroke-amber-400" : "stroke-red-400"
  const r = 36, c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#374151" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" className={ring} strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className={`text-2xl font-bold ${color}`}>{score}</p>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>
  )
}

function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    on_track: "bg-green-900/30 text-green-400 border border-green-800",
    at_risk: "bg-amber-900/30 text-amber-400 border border-amber-800",
    critical: "bg-red-900/30 text-red-400 border border-red-800",
    blocked: "bg-orange-900/30 text-orange-400 border border-orange-800",
  }
  const labels: Record<string, string> = {
    on_track: "On Track", at_risk: "At Risk", critical: "Critical", blocked: "Blocked"
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[risk] || styles.on_track}`}>{labels[risk] || risk}</span>
}

export default function SentinelPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  async function load() {
    setLoading(true)
    const r = await fetch("/api/us/sentinel").then(r => r.json()).catch(() => null)
    if (r) { setData(r); setLastRefresh(new Date()) }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 120000) // refresh every 2min
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/us" className="text-gray-400 hover:text-white text-sm">← Klaro US</Link>
          <span className="text-gray-700">|</span>
          <h1 className="font-bold text-white">Klaro Sentinel</h1>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">AI</span>
        </div>
        <div className="flex items-center gap-3">
          {data?.ai_powered && <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />AI Active</span>}
          <span className="text-xs text-gray-500">Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          <button onClick={load} disabled={loading} className="text-xs px-3 py-1.5 border border-gray-700 rounded-lg hover:border-gray-500 disabled:opacity-40">
            {loading ? "..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-pulse">🔍</div>
            <p className="text-gray-400 text-sm">Sentinel is analyzing your firm...</p>
          </div>
        </div>
      )}

      {data && (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Firm Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Firm Health Score</p>
              <HealthScore score={data.firm_health_score} />
              <p className="text-xs text-gray-500 mt-3 text-center">
                {data.firm_health_score >= 80 ? "Your firm is operating well" : data.firm_health_score >= 60 ? "Some areas need attention" : "Immediate action required"}
              </p>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Active Matters", value: data.stats.total, color: "text-blue-400" },
                { label: "On Track", value: data.stats.on_track, color: "text-green-400" },
                { label: "At Risk", value: data.stats.at_risk, color: "text-amber-400" },
                { label: "Critical", value: data.stats.critical, color: "text-red-400" },
                { label: "Overdue Tasks", value: data.stats.overdueTasks, color: "text-orange-400" },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {(data.recommendations?.length > 0 || data.capacity_warnings?.length > 0 || data.anomalies?.length > 0) && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">⚡ Sentinel Alerts</h2>
              <div className="space-y-2">
                {data.recommendations?.filter(Boolean).map((r: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-amber-900/20 border border-amber-800/50 rounded-xl px-4 py-3">
                    <span className="text-amber-400 flex-shrink-0">⚠</span>
                    <p className="text-sm text-amber-300">{r}</p>
                  </div>
                ))}
                {data.anomalies?.filter(Boolean).map((a: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-blue-900/20 border border-blue-800/50 rounded-xl px-4 py-3">
                    <span className="text-blue-400 flex-shrink-0">🔍</span>
                    <p className="text-sm text-blue-300">{a}</p>
                  </div>
                ))}
                {data.capacity_warnings?.filter(Boolean).map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3">
                    <span className="text-red-400 flex-shrink-0">🔴</span>
                    <p className="text-sm text-red-300">{w}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {/* Matter Health */}
            <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-300">Matter Health Monitor</h2>
                <span className="text-xs text-gray-500">{data.matters.length} active matters</span>
              </div>
              <div className="divide-y divide-gray-800">
                {data.matters.length === 0 && (
                  <p className="px-5 py-8 text-center text-gray-500 text-sm">No active matters found. Add matters in the Lawyer Suite.</p>
                )}
                {data.matters.map((m: any) => (
                  <div key={m.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">{m.client_name}</p>
                        <RiskBadge risk={m.risk} />
                      </div>
                      <p className="text-xs text-gray-400 truncate">{m.matter_title || m.matter_type || "Matter"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.insight}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      {m.predicted_delay_days > 0 && (
                        <p className="text-xs text-red-400 font-medium">+{m.predicted_delay_days}d delay</p>
                      )}
                      <p className="text-xs text-gray-500">{m.overdueTasks > 0 ? `${m.overdueTasks} overdue` : "No overdue tasks"}</p>
                      {m.nextHearingDays !== null && (
                        <p className="text-xs text-blue-400">{m.nextHearingDays}d to hearing</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Capacity */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-300">Team Capacity</h2>
                <p className="text-xs text-gray-500 mt-0.5">Hours this month</p>
              </div>
              <div className="divide-y divide-gray-800">
                {data.teamCapacity.length === 0 && (
                  <p className="px-5 py-8 text-center text-gray-500 text-sm">No employees found. Add team members in HR.</p>
                )}
                {data.teamCapacity.map((emp: any) => (
                  <div key={emp.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.role}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${emp.overloaded ? "text-red-400" : "text-green-400"}`}>
                          {emp.hoursThisMonth.toFixed(0)}h
                        </p>
                        {emp.overloaded && <p className="text-xs text-red-400">Over capacity</p>}
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${emp.overloaded ? "bg-red-500" : emp.hoursThisMonth > 120 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(100, (emp.hoursThisMonth / 200) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{emp.avgHoursPerWeek.toFixed(0)}h/week avg</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Hearings */}
          {data.stats.todayHearings > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-blue-300 mb-3">📅 Today's Hearings ({data.stats.todayHearings})</h2>
              <p className="text-xs text-blue-400">You have hearings scheduled today. Ensure all preparation is complete.</p>
              <Link href="/in/lawyer/hearings" className="text-xs text-blue-400 hover:text-blue-300 underline mt-2 inline-block">
                View hearings →
              </Link>
            </div>
          )}

          {/* Empty state */}
          {data.matters.length === 0 && data.teamCapacity.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-semibold mb-2">Sentinel is ready — add matters to get started</p>
              <p className="text-gray-400 text-sm mb-4">Sentinel analyzes your active matters, team capacity, and hearing schedule to predict problems before they happen.</p>
              <Link href="/in/lawyer/matters"
                className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors">
                Add your first matter →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
