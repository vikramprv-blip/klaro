"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"

export default function GSTNoticePage() {
  const [notices, setNotices] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysing, setAnalysing] = useState(false)
  const [form, setForm] = useState({ client_name: "", gstin: "", notice_text: "", tax_period: "" })

  async function load() {
    const r = await fetch("/api/ca/gst-notice").then(r => r.json())
    setNotices(r.notices || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAnalyse(e: any) {
    e.preventDefault()
    if (!form.notice_text.trim()) return
    setAnalysing(true)
    const res = await fetch("/api/ca/gst-notice", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, analyse: true })
    })
    const data = await res.json()
    setAnalysing(false)
    if (data.id) { setSelected(data); load() }
  }

  async function handleSave() {
    if (!selected) return
    await fetch("/api/ca/gst-notice", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status: selected.status, draft_response: selected.draft_response })
    })
    load()
  }

  const riskColor = (r: string) => r === "high" ? "bg-red-50 text-red-700" : r === "medium" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GST / IT / TDS Notice AI</h1>
        <p className="text-sm text-gray-500 mt-1">Paste any notice — AI identifies demand, deadline, risk and drafts response points</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Input */}
        <div className="col-span-2 space-y-4">
          <form onSubmit={handleAnalyse} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Analyse Notice</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">GSTIN</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="29AAAPL1234C1Z5"
                value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tax Period</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="FY 2023-24 / Oct 2024"
                value={form.tax_period} onChange={e => setForm({ ...form, tax_period: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notice Text * (paste full notice)</label>
              <textarea required rows={10} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Paste the complete notice text here..."
                value={form.notice_text} onChange={e => setForm({ ...form, notice_text: e.target.value })} />
            </div>
            <button disabled={analysing} className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
              {analysing ? "Analysing with AI..." : "🤖 Analyse Notice"}
            </button>
          </form>
        </div>

        {/* Analysis + Draft */}
        <div className="col-span-3 space-y-4">
          {selected?.ai_analysis && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">AI Analysis — {selected.client_name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor(selected.ai_analysis.risk_level)}`}>
                  {selected.ai_analysis.risk_level?.toUpperCase()} RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Notice Type", selected.ai_analysis.notice_type],
                  ["Section", selected.ai_analysis.section],
                  ["Tax Period", selected.ai_analysis.tax_period],
                  ["Demand Amount", selected.demand_amount > 0 ? `₹${Number(selected.demand_amount).toLocaleString("en-IN")}` : "—"],
                  ["Response Deadline", selected.ai_analysis.response_deadline || "—"],
                  ["Recommended Action", selected.ai_analysis.recommended_action],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{k}</p>
                    <p className="font-medium text-gray-900 text-xs">{v || "—"}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Key Issues</p>
                  <ul className="space-y-1">
                    {selected.ai_analysis.key_issues?.map((i: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 flex gap-2"><span className="text-red-500">•</span>{i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Documents Required</p>
                  <ul className="space-y-1">
                    {selected.ai_analysis.documents_required?.map((d: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 flex gap-2"><span className="text-blue-500">✓</span>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700">Draft Response</p>
                  <div className="flex gap-2">
                    <select className="text-xs border rounded px-2 py-1"
                      value={selected.status}
                      onChange={e => setSelected({ ...selected, status: e.target.value })}>
                      {["pending", "in_progress", "responded", "closed"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={handleSave} className="px-3 py-1 bg-gray-900 text-white rounded text-xs">Save</button>
                    <button onClick={() => navigator.clipboard.writeText(selected.draft_response)} className="px-3 py-1 border rounded text-xs">Copy</button>
                  </div>
                </div>
                <textarea rows={8} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  value={selected.draft_response || selected.ai_analysis.draft_response_points?.join("\n\n") || ""}
                  onChange={e => setSelected({ ...selected, draft_response: e.target.value })} />
              </div>
            </div>
          )}

          {/* Notices list */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">All Notices ({notices.length})</h2>
            </div>
            {notices.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No notices analysed yet</p>}
            {notices.map(n => (
              <div key={n.id} onClick={() => setSelected(n)}
                className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${selected?.id === n.id ? "bg-blue-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{n.client_name}</p>
                  <div className="flex gap-2">
                    {n.ai_analysis?.risk_level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${riskColor(n.ai_analysis.risk_level)}`}>
                        {n.ai_analysis.risk_level}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${n.status === "closed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {n.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{n.notice_type || "Unknown type"} · {n.gstin || "No GSTIN"} · ₹{Number(n.demand_amount || 0).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
