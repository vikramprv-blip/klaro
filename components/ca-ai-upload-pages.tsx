"use client"
import { useState } from "react"
import FileUpload from "@/components/file-upload"

// ── 26AS Analyser with file upload ───────────────────────────────────────────
export function Form26ASPage() {
  const [text, setText]       = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")
  const [mode, setMode]       = useState<"file"|"paste">("file")

  async function handle() {
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
      <h1 className="text-xl font-medium text-gray-900 mb-1">Form 26AS analyser</h1>
      <p className="text-sm text-gray-400 mb-6">Upload 26AS PDF or paste text — AI extracts TDS credits, AIS entries, flags mismatches</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex gap-2 mb-3">
            {(["file","paste"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize ${mode === m ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {m === "file" ? "Upload PDF" : "Paste text"}
              </button>
            ))}
          </div>
          {mode === "file" ? (
            <div className="space-y-3">
              <FileUpload onTextExtracted={t => setText(t)} accept=".pdf,.txt"
                label="Drop Form 26AS / AIS PDF" hint="Download from incometax.gov.in" />
              {text && <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">{text.length} characters extracted</p>}
            </div>
          ) : (
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste 26AS or AIS text..."
              className="w-full h-52 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          )}
          <button onClick={handle} disabled={!text.trim() || loading}
            className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
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
                    <div key={i} className="flex justify-between text-xs border-b border-gray-50 pb-1">
                      <span className="text-gray-600">{e.deductor} <span className="text-gray-400">({e.section})</span></span>
                      <span className="font-medium text-gray-900">{e.amount}</span>
                    </div>
                  ))}
                  {(!result.tds_entries?.length) && <p className="text-xs text-gray-400">No TDS entries extracted</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total TDS",        value: result.total_tds },
                  { label: "Advance tax",      value: result.advance_tax },
                  { label: "Self-assessment",  value: result.self_assessment_tax },
                ].filter(x => x.value).map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {result.mismatches?.length > 0 && (
                <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-amber-800 mb-2">Potential mismatches</p>
                  {result.mismatches.map((m: string, i: number) => <p key={i} className="text-xs text-amber-700 mb-1">• {m}</p>)}
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-blue-800 mb-2">Recommendations</p>
                  {result.recommendations.map((r: string, i: number) => <p key={i} className="text-xs text-blue-700 mb-1">• {r}</p>)}
                </div>
              )}
              {result.summary && <div className="border border-gray-100 rounded-xl p-4"><p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p></div>}
            </div>
          )}
          {!loading && !result && <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl"><p className="text-sm text-gray-300">Analysis will appear here</p></div>}
        </div>
      </div>
    </div>
  )
}

// ── GSTR-2B Reconciler with file upload ──────────────────────────────────────
export function GSTR2BReconPage() {
  const [gstr2b, setGstr2b]       = useState("")
  const [purchases, setPurchases] = useState("")
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<any>(null)
  const [error, setError]         = useState("")

  async function handle() {
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
      <h1 className="text-xl font-medium text-gray-900 mb-1">GSTR-2B reconciler</h1>
      <p className="text-sm text-gray-400 mb-6">Upload or paste GSTR-2B and purchase register — AI flags mismatches and ITC at risk</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">GSTR-2B</label>
          <FileUpload onTextExtracted={t => setGstr2b(t)} accept=".pdf,.xlsx,.csv,.txt"
            label="Drop GSTR-2B file" hint="PDF, Excel or CSV from GST portal" />
          {gstr2b && (
            <textarea value={gstr2b} onChange={e => setGstr2b(e.target.value)}
              className="w-full h-24 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-2 focus:outline-none resize-none" />
          )}
          {!gstr2b && (
            <textarea value={gstr2b} onChange={e => setGstr2b(e.target.value)}
              placeholder="Or paste GSTR-2B data..."
              className="w-full h-24 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-2 focus:outline-none resize-none" />
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Purchase register / books</label>
          <FileUpload onTextExtracted={t => setPurchases(t)} accept=".xlsx,.csv,.txt"
            label="Drop purchase register" hint="Excel or CSV with invoice data" />
          {purchases && (
            <textarea value={purchases} onChange={e => setPurchases(e.target.value)}
              className="w-full h-24 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-2 focus:outline-none resize-none" />
          )}
          {!purchases && (
            <textarea value={purchases} onChange={e => setPurchases(e.target.value)}
              placeholder="Or paste purchase register..."
              className="w-full h-24 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-2 focus:outline-none resize-none" />
          )}
        </div>
      </div>
      <button onClick={handle} disabled={!gstr2b.trim() || !purchases.trim() || loading}
        className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
        {loading ? "Reconciling..." : "Run reconciliation →"}
      </button>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {loading && <div className="mt-4 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "ITC in GSTR-2B", value: result.total_itc_2b, color: "text-gray-900" },
              { label: "ITC in books",   value: result.total_itc_books, color: "text-gray-900" },
              { label: "Difference",     value: result.difference, color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-semibold ${color}`}>{value ?? "—"}</p>
              </div>
            ))}
          </div>
          {result.mismatches?.length > 0 && (
            <div className="border border-red-100 rounded-xl p-4">
              <p className="text-xs font-medium text-red-700 mb-3">Mismatches ({result.mismatches.length})</p>
              {result.mismatches.map((m: any, i: number) => (
                <div key={i} className="text-xs text-gray-600 border-b border-gray-50 pb-2 mb-2">
                  <span className="font-medium">{m.supplier}</span> — {m.issue} {m.amount && `(${m.amount})`}
                </div>
              ))}
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

// ── P&L Parser with file upload ───────────────────────────────────────────────
export function PLParserPage() {
  const [text, setText]       = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")
  const [mode, setMode]       = useState<"file"|"paste">("file")

  async function handle() {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/pl-parser", {
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
      <h1 className="text-xl font-medium text-gray-900 mb-1">P&L / Balance sheet parser</h1>
      <p className="text-sm text-gray-400 mb-6">Upload financial statements PDF or Excel — AI extracts figures, spots anomalies, pre-fills audit checklist</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex gap-2 mb-3">
            {(["file","paste"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize ${mode === m ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {m === "file" ? "Upload file" : "Paste text"}
              </button>
            ))}
          </div>
          {mode === "file" ? (
            <div className="space-y-3">
              <FileUpload onTextExtracted={t => setText(t)} accept=".pdf,.xlsx,.csv,.txt"
                label="Drop P&L / Balance sheet" hint="PDF, Excel, or CSV" />
              {text && <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">{text.length} characters extracted</p>}
            </div>
          ) : (
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste financial statement figures..."
              className="w-full h-52 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          )}
          <button onClick={handle} disabled={!text.trim() || loading}
            className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
            {loading ? "Parsing..." : "Parse financials →"}
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
        <div>
          {loading && <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
          {result && (
            <div className="space-y-4">
              {result.key_figures && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-3">Key figures</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.key_figures).map(([k, v]) => (
                      <div key={k}><span className="text-xs text-gray-400">{k}: </span><span className="text-xs font-medium text-gray-700">{v as string}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {result.ratios && Object.keys(result.ratios).length > 0 && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Key ratios</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.ratios).map(([k, v]) => (
                      <div key={k}><span className="text-xs text-gray-400">{k}: </span><span className="text-xs font-medium text-gray-700">{v as string}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {result.anomalies?.length > 0 && (
                <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-amber-800 mb-2">Anomalies flagged</p>
                  {result.anomalies.map((a: string, i: number) => <p key={i} className="text-xs text-amber-700 mb-1">• {a}</p>)}
                </div>
              )}
              {result.audit_checklist?.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Audit checklist</p>
                  {result.audit_checklist.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <span className="text-gray-300 text-xs mt-0.5">□</span>
                      <span className="text-xs text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.summary && <div className="border border-gray-100 rounded-xl p-4"><p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p></div>}
            </div>
          )}
          {!loading && !result && <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl"><p className="text-sm text-gray-300">Analysis will appear here</p></div>}
        </div>
      </div>
    </div>
  )
}
