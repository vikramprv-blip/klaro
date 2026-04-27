"use client"
import { useEffect, useState, useCallback } from "react"

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 4 }).format(n || 0);
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN");
}

export default function AiAuditPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const load = useCallback(async () => {
    const url = filter ? `/api/admin/ai-usage?limit=200&feature=${filter}` : `/api/admin/ai-usage?limit=200`
    const res = await fetch(url)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [filter])

  useEffect(() => {
    load()
    if (!autoRefresh) return;
    const interval = setInterval(load, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [load, autoRefresh])

  if (loading) return <div className="p-8 text-gray-400">Loading AI audit log...</div>

  const features = Object.keys(data?.byFeature || {}).sort((a, b) => data.byFeature[b].calls - data.byFeature[a].calls)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤖 AI Audit Log</h1>
          <p className="text-sm text-gray-500">Live tracking of all AI calls across Klaro</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setAutoRefresh(a => !a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${autoRefresh ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500"}`}>
            {autoRefresh ? "● Live" : "○ Paused"}
          </button>
          <button onClick={load} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs">Refresh</button>
          <a href="/admin" className="px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-gray-100">← Admin</a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total AI Calls", value: data?.totalCalls || 0, icon: "🤖" },
          { label: "Total Tokens", value: (data?.totalTokens || 0).toLocaleString(), icon: "🔤" },
          { label: "Est. Cost (INR)", value: fmt(data?.totalCost || 0), icon: "💰" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Breakdown */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-4">Usage by Feature</h2>
        {features.length === 0 && <p className="text-gray-400 text-sm">No AI calls logged yet. Use any AI feature to see logs here.</p>}
        <div className="space-y-3">
          {features.map(feature => {
            const f = data.byFeature[feature]
            const pct = Math.min(100, (f.calls / data.totalCalls) * 100)
            return (
              <div key={feature}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFilter(filter === feature ? "" : feature)}
                      className={`font-medium px-2 py-0.5 rounded text-xs ${filter === feature ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      {feature}
                    </button>
                    <span className="text-gray-500">{f.calls} calls · {f.tokens.toLocaleString()} tokens</span>
                  </div>
                  <span className="text-gray-500 font-medium">{fmt(f.cost)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-gray-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Log Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            Live Log {filter && <span className="text-sm text-gray-500 font-normal ml-2">filtering: {filter} <button onClick={() => setFilter("")} className="text-red-500 ml-1">×</button></span>}
          </h2>
          <span className="text-xs text-gray-400">{data?.logs?.length || 0} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {["Time", "Feature", "Model", "Tokens", "Cost (INR)", "Firm"].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.logs?.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No AI calls logged yet</td></tr>
              )}
              {data?.logs?.map((log: any, i: number) => (
                <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{timeAgo(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{log.feature}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.model || "—"}</td>
                  <td className="px-4 py-3 font-medium">{(log.tokens_used || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{fmt(log.cost_inr || 0)}</td>
                  <td className="px-4 py-3 text-gray-500">{log.firms?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
