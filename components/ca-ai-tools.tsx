"use client"
import { useState } from "react"
import FileUpload from "@/components/file-upload"

// ── P&L Parser ────────────────────────────────────────────────────────────────
export function PLParserPage() {
  const [text, setText]       = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")

  async function handle() {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/pl-parser", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
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
      <p className="text-sm text-gray-400 mb-6">Paste financial statements — AI extracts key figures, spots anomalies, pre-fills tax audit checklist</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <FileUpload onTextExtracted={(t: string) => setText(t)} accept=".pdf,.xlsx,.csv,.txt" label="Drop P&L / Balance sheet" hint="PDF, Excel or CSV" />

<textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste P&L and/or balance sheet figures. Include revenue, expenses, assets, liabilities..."
            className="w-full h-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
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
                  <p className="text-xs font-medium text-gray-600 mb-3">Key figures extracted</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.key_figures).map(([k,v]) => (
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
                  <p className="text-xs font-medium text-gray-600 mb-2">Audit checklist items</p>
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
          {!loading && !result && <div className="h-full flex items-center justify-center"><p className="text-sm text-gray-300">Analysis will appear here</p></div>}
        </div>
      </div>
    </div>
  )
}

// ── GST Health Check ──────────────────────────────────────────────────────────
export function GSTHealthPage() {
  const [details, setDetails]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<any>(null)
  const [error, setError]       = useState("")

  async function handle() {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/gst-health", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ details }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const SCORE_COLOR = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-amber-600" : "text-red-600"

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-medium text-gray-900 mb-1">GST health check</h1>
      <p className="text-sm text-gray-400 mb-6">Describe client's GST position — AI generates a health report with score and recommendations</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <FileUpload onTextExtracted={(t: string) => setDetails(t)} accept=".pdf,.txt" label="Upload GST data" hint="or paste below" />

<textarea value={details} onChange={e => setDetails(e.target.value)}
            placeholder="Describe the client's GST situation. E.g.: GSTIN, turnover, filing status (any late filings?), ITC claims vs liability, any mismatches in 2B, pending refunds, recent notices..."
            className="w-full h-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          <button onClick={handle} disabled={!details.trim() || loading}
            className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
            {loading ? "Generating report..." : "Run health check →"}
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
        <div>
          {loading && <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
          {result && (
            <div className="space-y-4">
              {result.health_score != null && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-xs text-gray-400 mb-1">GST health score</p>
                  <p className={`text-5xl font-bold ${SCORE_COLOR(result.health_score)}`}>{result.health_score}<span className="text-xl text-gray-400">/100</span></p>
                  <p className="text-sm text-gray-500 mt-2">{result.grade}</p>
                </div>
              )}
              {result.strengths?.length > 0 && (
                <div className="border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-green-700 mb-2">Strengths</p>
                  {result.strengths.map((s: string, i: number) => <p key={i} className="text-xs text-green-600 mb-1">✓ {s}</p>)}
                </div>
              )}
              {result.risks?.length > 0 && (
                <div className="border border-red-100 bg-red-50/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-red-700 mb-2">Risk areas</p>
                  {result.risks.map((r: string, i: number) => <p key={i} className="text-xs text-red-600 mb-1">⚠ {r}</p>)}
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-blue-800 mb-2">Recommended actions</p>
                  {result.recommendations.map((r: string, i: number) => <p key={i} className="text-xs text-blue-700 mb-1">{i+1}. {r}</p>)}
                </div>
              )}
            </div>
          )}
          {!loading && !result && <div className="h-full flex items-center justify-center"><p className="text-sm text-gray-300">Report will appear here</p></div>}
        </div>
      </div>
    </div>
  )
}

// ── Penalty Calculator ────────────────────────────────────────────────────────
export function PenaltyCalcPage() {
  const [form, setForm] = useState({ tax_type: "GST", return_type: "GSTR-3B", due_date: "", filed_date: "", tax_amount: "", turnover: "" })
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")

  async function handle() {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/penalty-calc", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-medium text-gray-900 mb-1">Penalty calculator</h1>
      <p className="text-sm text-gray-400 mb-6">Calculate exact penalty + interest for late GST/TDS/ITR filings under relevant sections</p>
      <div className="border border-gray-100 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tax type</label>
            <select value={form.tax_type} onChange={e => setForm(p => ({...p, tax_type: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
              {["GST","TDS","Income Tax","Advance Tax"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Return / form type</label>
            <input type="text" value={form.return_type} onChange={e => setForm(p => ({...p, return_type: e.target.value}))}
              placeholder="e.g. GSTR-3B, 26Q, ITR-3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Filed date (or today if still pending)</label>
            <input type="date" value={form.filed_date} onChange={e => setForm(p => ({...p, filed_date: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tax / duty amount (₹)</label>
            <input type="number" value={form.tax_amount} onChange={e => setForm(p => ({...p, tax_amount: e.target.value}))}
              placeholder="e.g. 50000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Turnover (₹) — for GST late fee calc</label>
            <input type="number" value={form.turnover} onChange={e => setForm(p => ({...p, turnover: e.target.value}))}
              placeholder="e.g. 5000000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          </div>
        </div>
        <button onClick={handle} disabled={!form.due_date || !form.filed_date || loading}
          className="mt-4 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
          {loading ? "Calculating..." : "Calculate penalty →"}
        </button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
      {loading && <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Late fee",      value: result.late_fee ?? "—",      color: "text-red-600" },
              { label: "Interest",      value: result.interest ?? "—",      color: "text-amber-600" },
              { label: "Total payable", value: result.total_payable ?? "—", color: "text-red-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          {result.calculation_breakdown && (
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-600 mb-2">How it's calculated</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{result.calculation_breakdown}</pre>
            </div>
          )}
          {result.sections_invoked && (
            <div className="border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Sections: </span>{result.sections_invoked}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Doc Chaser ────────────────────────────────────────────────────────────────
export function DocChaserPage() {
  const [form, setForm] = useState({ client_name: "", missing_docs: "", service_type: "ITR filing", ca_name: "" })
  const [channel, setChannel] = useState<"whatsapp"|"email">("whatsapp")
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")

  async function handle() {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/doc-chaser", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, channel }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-medium text-gray-900 mb-1">Smart document chaser</h1>
      <p className="text-sm text-gray-400 mb-6">AI drafts a personalised, professional message to chase documents from your client — not a generic reminder</p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {[
            { key: "client_name",  label: "Client name",    type: "text", ph: "e.g. Ravi Shankar Exports Pvt Ltd" },
            { key: "ca_name",      label: "Your name (CA)", type: "text", ph: "e.g. CA Priya Mehta" },
            { key: "service_type", label: "Service",        type: "text", ph: "e.g. ITR filing AY 2026-27" },
          ].map(({ key, label, type, ph }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))}
                placeholder={ph}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Documents missing</label>
            <textarea value={form.missing_docs} onChange={e => setForm(p => ({...p, missing_docs: e.target.value}))}
              placeholder="List the documents you need: e.g. Form 16, bank statements for Apr-Mar 2025-26, investment proofs under 80C, rental agreement..."
              className="w-full h-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          </div>
          <div className="flex gap-2">
            {(["whatsapp","email"] as const).map(c => (
              <button key={c} onClick={() => setChannel(c)}
                className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${channel === c ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={handle} disabled={!form.client_name || !form.missing_docs || loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
            {loading ? "Drafting..." : "Draft message →"}
          </button>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div>
          {loading && <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
          {result && (
            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">{channel === "whatsapp" ? "WhatsApp message" : "Email draft"}</p>
                  <button onClick={() => navigator.clipboard.writeText(result.message)} className="text-xs text-blue-500 hover:underline">Copy</button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.message}</pre>
              </div>
              {result.follow_up && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500">Follow-up (if no reply in 3 days)</p>
                    <button onClick={() => navigator.clipboard.writeText(result.follow_up)} className="text-xs text-blue-500 hover:underline">Copy</button>
                  </div>
                  <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans leading-relaxed">{result.follow_up}</pre>
                </div>
              )}
            </div>
          )}
          {!loading && !result && <div className="h-full flex items-center justify-center"><p className="text-sm text-gray-300">Message will appear here</p></div>}
        </div>
      </div>
    </div>
  )
}

// ── Tax Optimiser ─────────────────────────────────────────────────────────────
export function TaxOptimiserPage() {
  const [form, setForm] = useState({
    name: "", age: "", employment: "salaried", gross_income: "", hra: "", home_loan: "",
    investments_80c: "", nps: "", medical_insurance: "", other_deductions: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState("")

  async function handle() {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch("/api/ca/ai/tax-optimiser", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-medium text-gray-900 mb-1">Tax optimiser</h1>
      <p className="text-sm text-gray-400 mb-6">Old vs new regime comparison + deduction suggestions for AY 2026-27</p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Client name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ravi Sharma"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Age</label>
              <input type="number" value={form.age} onChange={e => setForm(p => ({...p, age: e.target.value}))} placeholder="35"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Employment type</label>
            <select value={form.employment} onChange={e => setForm(p => ({...p, employment: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
              {["salaried","business","professional","salaried+business"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          {[
            { key: "gross_income",      label: "Gross income (₹)",          ph: "1200000" },
            { key: "hra",               label: "HRA received (₹)",           ph: "240000" },
            { key: "home_loan",         label: "Home loan interest (₹)",     ph: "150000" },
            { key: "investments_80c",   label: "80C investments (₹)",        ph: "150000" },
            { key: "nps",               label: "NPS contribution (₹)",       ph: "50000" },
            { key: "medical_insurance", label: "Medical insurance (₹)",      ph: "25000" },
            { key: "other_deductions",  label: "Other deductions (describe)",ph: "Donations, education loan..." },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input type="text" value={(form as any)[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))} placeholder={ph}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          ))}
          <button onClick={handle} disabled={!form.gross_income || loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
            {loading ? "Calculating..." : "Calculate optimal tax →"}
          </button>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div>
          {loading && <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>}
          {result && (
            <div className="space-y-4">
              <div className={`rounded-xl p-5 ${result.recommended_regime === "new" ? "bg-green-50 border border-green-100" : "bg-blue-50 border border-blue-100"}`}>
                <p className="text-xs font-medium text-gray-600 mb-1">Recommended regime</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{result.recommended_regime} regime</p>
                <p className="text-sm text-gray-600 mt-1">Saves ₹{result.savings_amount ?? "—"} vs the other regime</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Old regime tax",  value: result.old_regime_tax,  color: "text-gray-700" },
                  { label: "New regime tax",  value: result.new_regime_tax,  color: "text-gray-700" },
                  { label: "Effective rate (old)", value: result.effective_rate_old, color: "text-gray-500" },
                  { label: "Effective rate (new)", value: result.effective_rate_new, color: "text-gray-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className={`text-sm font-semibold ${color}`}>{value ?? "—"}</p>
                  </div>
                ))}
              </div>
              {result.optimisation_tips?.length > 0 && (
                <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                  <p className="text-xs font-medium text-blue-800 mb-2">Ways to reduce tax further</p>
                  {result.optimisation_tips.map((t: string, i: number) => (
                    <p key={i} className="text-xs text-blue-700 mb-1">{i+1}. {t}</p>
                  ))}
                </div>
              )}
              {result.summary && <div className="border border-gray-100 rounded-xl p-4"><p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p></div>}
            </div>
          )}
          {!loading && !result && <div className="h-full flex items-center justify-center"><p className="text-sm text-gray-300">Analysis will appear here</p></div>}
        </div>
      </div>
    </div>
  )
}
