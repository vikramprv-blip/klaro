"use client"
import { useState } from "react"
import FileUpload from "@/components/file-upload"

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Form 26AS analyser</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Upload or paste 26AS — AI extracts TDS credits and flags mismatches
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>

          {/* NEW: Upload */}
          <FileUpload
            onTextExtracted={(t) => setText(t)}
            accept=".pdf,.txt"
            label="Drop 26AS PDF"
            hint="or paste below"
          />

          {/* Existing textarea */}
          <label className="text-xs font-medium text-gray-500 mt-4 mb-2 block">
            Paste Form 26AS / AIS data
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the text from Form 26AS or AIS..."
            className="w-full h-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />

          <button
            onClick={handleAnalyse}
            disabled={!text.trim() || loading}
            className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "Analysing..." : "Analyse 26AS →"}
          </button>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        </div>

        <div>
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          )}

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
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Total TDS credit</p>
                <p className="text-2xl font-semibold text-gray-900">{result.total_tds ?? "—"}</p>
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
