"use client"
// ── app/ca/ai/form-26as/page.tsx ─────────────────────────────────────────────
import { useState } from "react"

export default function Form26ASPage() {
  const [text, setText]       = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")

  async function handleAnalyse() {
    if (!text.trim()) return
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/form-26as", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Form 26AS analyser</h1>
        <p className="text-sm text-gray-400 mt-0.5">Paste 26AS text — AI extracts TDS credits, AIS entries, flags mismatches with declared income</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Paste Form 26AS / AIS data</label>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste the text from Form 26AS or AIS. Include TDS entries, advance tax payments, interest credits, etc. You can copy from the income tax portal."
            className="w-full h-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          <button onClick={handleAnalyse} disabled={!text.trim() || loading}
            className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
            {loading ? "Analysing..." : "Analyse 26AS →"}
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        <div>
          {loading && <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
          {result && (
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-3">TDS credits found</p>
                <div className="space-y-2">
                  {result.tds_entries?.map((e: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-600">{e.deductor} ({e.section})</span>
                      <span className="font-medium text-gray-900">₹{e.amount}</span>
                    </div>
                  ))}
                  {(!result.tds_entries || result.tds_entries.length === 0) && <p className="text-xs text-gray-400">No TDS entries extracted</p>}
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Total TDS credit</p>
                <p className="text-2xl font-semibold text-gray-900">{result.total_tds ?? "—"}</p>
              </div>
              {result.mismatches?.length > 0 && (
                <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-amber-800 mb-2">Potential mismatches flagged</p>
                  {result.mismatches.map((m: string, i: number) => (
                    <p key={i} className="text-xs text-amber-700 mb-1">• {m}</p>
                  ))}
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-blue-800 mb-2">Recommendations</p>
                  {result.recommendations.map((r: string, i: number) => (
                    <p key={i} className="text-xs text-blue-700 mb-1">• {r}</p>
                  ))}
                </div>
              )}
              {result.summary && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Summary</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
                </div>
              )}
            </div>
          )}
          {!loading && !result && (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-300">Analysis will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
