"use client"
// ── app/ca/ai/gstr2b-recon/page.tsx ─────────────────────────────────────────
import { useState } from "react"

export default function GSTR2BReconPage() {
  const [gstr2b, setGstr2b]     = useState("")
  const [purchases, setPurchases] = useState("")
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<any>(null)
  const [error, setError]       = useState("")

  async function handleReconcile() {
    if (!gstr2b.trim() || !purchases.trim()) return
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/gstr2b-recon", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstr2b, purchases }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">GSTR-2B reconciler</h1>
        <p className="text-sm text-gray-400 mt-0.5">Paste GSTR-2B data and your purchase register — AI flags mismatches, missing invoices, ITC at risk</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">GSTR-2B data</label>
          <textarea value={gstr2b} onChange={e => setGstr2b(e.target.value)}
            placeholder="Paste GSTR-2B summary: supplier GSTIN, invoice numbers, amounts, ITC available..."
            className="w-full h-44 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Purchase register / books</label>
          <textarea value={purchases} onChange={e => setPurchases(e.target.value)}
            placeholder="Paste your purchase register entries: vendor, invoice date, invoice no, amount, GST claimed..."
            className="w-full h-44 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
        </div>
      </div>
      <button onClick={handleReconcile} disabled={!gstr2b.trim() || !purchases.trim() || loading}
        className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors">
        {loading ? "Reconciling..." : "Run reconciliation →"}
      </button>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {loading && <div className="mt-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "ITC in GSTR-2B", value: result.total_itc_2b ?? "—", color: "text-gray-900" },
              { label: "ITC in books",   value: result.total_itc_books ?? "—", color: "text-gray-900" },
              { label: "Difference",     value: result.difference ?? "—", color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          {result.mismatches?.length > 0 && (
            <div className="border border-red-100 rounded-xl p-4">
              <p className="text-xs font-medium text-red-700 mb-3">Mismatches found ({result.mismatches.length})</p>
              <div className="space-y-2">
                {result.mismatches.map((m: any, i: number) => (
                  <div key={i} className="text-xs text-gray-600 border-b border-gray-50 pb-2">
                    <span className="font-medium">{m.supplier}</span> — {m.issue} {m.amount && `(₹${m.amount})`}
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.recommendations?.length > 0 && (
            <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-800 mb-2">Actions to take</p>
              {result.recommendations.map((r: string, i: number) => <p key={i} className="text-xs text-blue-700 mb-1">• {r}</p>)}
            </div>
          )}
          {result.summary && <div className="border border-gray-100 rounded-xl p-4"><p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p></div>}
        </div>
      )}
    </div>
  )
}
