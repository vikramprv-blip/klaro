"use client"
import { useState } from "react"

type NoticeResult = {
  notice_type: string
  issuing_authority: string
  gstin_or_pan: string
  tax_period: string
  demand_amount: string
  reply_deadline: string
  summary: string
  key_issues: string[]
  reply_draft: string
  documents_needed: string[]
  urgency: string
}

export default function NoticeReaderPage() {
  const [text, setText]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<NoticeResult | null>(null)
  const [error, setError]       = useState("")

  async function handleAnalyse() {
    if (!text.trim()) return
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/notice-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message ?? "Analysis failed")
    }
    setLoading(false)
  }

  const URGENCY_STYLE: Record<string,string> = {
    high:   "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low:    "bg-green-50 text-green-700 border-green-200",
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Notice reader</h1>
        <p className="text-sm text-gray-400 mt-0.5">Paste any GST, Income Tax, or TDS notice — AI reads it, classifies it, and drafts your reply</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Paste notice text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the full text of the notice here. You can copy-paste from a PDF or type key details like: notice type, GSTIN/PAN, tax period, demand amount, deadline..."
            className="w-full h-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
          <button
            onClick={handleAnalyse}
            disabled={!text.trim() || loading}
            className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "Analysing notice..." : "Analyse notice →"}
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 mb-2">What this AI does:</p>
            <ul className="space-y-1.5">
              {[
                "Identifies notice type (SCN, demand, assessment, audit)",
                "Extracts key details — GSTIN, period, demand amount, deadline",
                "Flags the legal provisions invoked",
                "Drafts a structured reply you can adapt",
                "Lists documents needed to respond",
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="text-green-500 text-xs mt-0.5">✓</span>
                  <span className="text-xs text-gray-500">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
              <p className="text-xs text-gray-400 text-center mt-4">Claude is reading the notice...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Header info */}
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-700">{result.notice_type}</span>
                  <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${URGENCY_STYLE[result.urgency] ?? URGENCY_STYLE.medium}`}>
                    {result.urgency} urgency
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Authority",    value: result.issuing_authority },
                    { label: "GSTIN/PAN",    value: result.gstin_or_pan },
                    { label: "Period",       value: result.tax_period },
                    { label: "Demand",       value: result.demand_amount },
                    { label: "Reply by",     value: result.reply_deadline },
                  ].map(({ label, value }) => value && value !== "—" && (
                    <div key={label}>
                      <span className="text-gray-400">{label}: </span>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Summary</p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
              </div>

              {/* Key issues */}
              {result.key_issues?.length > 0 && (
                <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-amber-800 mb-2">Key issues raised</p>
                  <ul className="space-y-1">
                    {result.key_issues.map((issue, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                        <span className="mt-0.5">•</span>{issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents needed */}
              {result.documents_needed?.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Documents needed to reply</p>
                  <ul className="space-y-1">
                    {result.documents_needed.map((doc, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                        <span className="text-gray-300 mt-0.5">□</span>{doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reply draft */}
              <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-blue-800">Draft reply</p>
                  <button onClick={() => navigator.clipboard.writeText(result.reply_draft)}
                    className="text-xs text-blue-600 hover:underline">Copy</button>
                </div>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">{result.reply_draft}</pre>
              </div>
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
