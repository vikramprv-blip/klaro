"use client"
import { useState } from "react"
import FileUpload from "@/components/file-upload"

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
        <p className="text-sm text-gray-400 mt-0.5">
          Upload or paste any GST, Income Tax, or TDS notice — AI reads it and drafts your reply
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>

          {/* NEW: Upload block */}
          <FileUpload
            onTextExtracted={(t: string) => setText(t)}
            accept=".pdf,.txt"
            label="Drop notice PDF"
            hint="or paste text below"
          />

          {/* Existing textarea */}
          <label className="text-xs font-medium text-gray-500 mt-4 mb-2 block">
            Paste notice text
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the full text of the notice here..."
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

              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-700">{result.notice_type}</span>
                  <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${URGENCY_STYLE[result.urgency] ?? URGENCY_STYLE.medium}`}>
                    {result.urgency} urgency
                  </span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Summary</p>
                <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
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
