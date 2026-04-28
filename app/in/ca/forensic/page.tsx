"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import SearchableSelect from "@/components/SearchableSelect"

const ENGAGEMENT_TYPES = [
  { value: "fraud_investigation", label: "Fraud Investigation" },
  { value: "asset_tracing", label: "Asset Tracing" },
  { value: "aml_review", label: "AML / KYC Review" },
  { value: "litigation_support", label: "Litigation Support" },
  { value: "forensic_accounting", label: "Forensic Accounting" },
  { value: "due_diligence", label: "Due Diligence" },
  { value: "whistleblower", label: "Whistleblower Investigation" },
]
const COUNTRIES = ["India","United States","United Kingdom","UAE","Singapore","Australia","Canada","Germany","France","Other"]
const CURRENCIES = ["INR","USD","GBP","AED","SGD","AUD","CAD","EUR"]
const STANDARDS = ["ACFE","IIA","IFAC ISA 240","FATF","PCAOB AS 2401","ICAI SA 240"]
const FLAG_TYPES = ["round_tripping","layering","structuring","related_party","unusual_timing","no_business_purpose","over_invoicing","under_invoicing","phantom_vendor","cash_intensive"]
const FINDING_TYPES = ["fraud_indicator","control_weakness","policy_violation","aml_red_flag","conflict_of_interest","misrepresentation","asset_misappropriation","financial_statement_fraud","bribery_corruption"]

function fmt(n: number, currency = "INR") {
  const symbols: Record<string, string> = { INR: "₹", USD: "$", GBP: "£", AED: "د.إ", SGD: "S$" }
  return `${symbols[currency] || currency} ${Number(n || 0).toLocaleString()}`
}

function severityBadge(s: string) {
  const cls = s === "critical" ? "bg-red-100 text-red-800 border border-red-200" : s === "high" ? "bg-orange-100 text-orange-800 border border-orange-200" : s === "medium" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s}</span>
}

export default function ForensicAuditPage() {
  const [tab, setTab] = useState<"engagements"|"findings"|"transactions"|"interviews"|"aml"|"reports">("engagements")
  const [engagements, setEngagements] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [findings, setFindings] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [amlChecks, setAmlChecks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [selectedEng, setSelectedEng] = useState<string>("")
  const [showEngForm, setShowEngForm] = useState(false)

  const [engForm, setEngForm] = useState({
    client_name: "", engagement_type: "fraud_investigation", country: "India",
    currency: "INR", scope: "", period_from: "", period_to: "",
    risk_rating: "medium", standard: "ACFE", lead_investigator: "",
    fee_estimate: "", estimated_hours: "", notes: ""
  })
  const [findingForm, setFindingForm] = useState({
    title: "", description: "", finding_type: "fraud_indicator",
    severity: "high", financial_impact: "", recommendation: ""
  })
  const [txForm, setTxForm] = useState({
    transaction_date: "", description: "", party_from: "", party_to: "",
    amount: "", currency: "INR", account_from: "", account_to: "",
    transaction_ref: "", flag_type: "", flag_severity: "medium", is_flagged: false, investigator_notes: ""
  })
  const [interviewForm, setInterviewForm] = useState({
    interview_date: "", interviewee_name: "", interviewee_role: "", interviewee_org: "",
    conducted_by: "", location: "", interview_type: "in_person",
    key_findings: "", recording_consent: false, notes: ""
  })
  const [amlForm, setAmlForm] = useState({
    entity_name: "", entity_type: "individual", id_number: "", id_type: "pan",
    country: "India", pep_check: "not_checked", sanctions_check: "not_checked",
    adverse_media: "not_checked", checked_by: "", notes: ""
  })

  async function load() {
    const [er, fr, tr, ir, ar] = await Promise.all([
      fetch("/api/forensic/engagements").then(r => r.json()),
      fetch(`/api/forensic/findings${selectedEng ? `?engagement_id=${selectedEng}` : ""}`).then(r => r.json()),
      fetch(`/api/forensic/transactions${selectedEng ? `?engagement_id=${selectedEng}` : ""}`).then(r => r.json()),
      fetch(`/api/forensic/interviews${selectedEng ? `?engagement_id=${selectedEng}` : ""}`).then(r => r.json()),
      fetch(`/api/forensic/aml${selectedEng ? `?engagement_id=${selectedEng}` : ""}`).then(r => r.json()),
    ])
    setEngagements(er.engagements || [])
    setStats(er.stats || {})
    setFindings(Array.isArray(fr) ? fr : [])
    setTransactions(Array.isArray(tr) ? tr : [])
    setInterviews(Array.isArray(ir) ? ir : [])
    setAmlChecks(Array.isArray(ar) ? ar : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedEng])

  const engOptions = engagements.map(e => ({ value: e.id, label: `${e.engagement_no} — ${e.client_name}`, sub: `${e.engagement_type} · ${e.country} · ${e.status}` }))

  async function createEngagement(ev: any) {
    ev.preventDefault(); setSaving(true)
    await fetch("/api/forensic/engagements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(engForm) })
    setSaving(false); setShowEngForm(false); load()
  }

  async function createFinding(ev: any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an engagement first")
    setSaving(true)
    await fetch("/api/forensic/findings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...findingForm, engagement_id: selectedEng, financial_impact: Number(findingForm.financial_impact || 0) }) })
    setSaving(false)
    setFindingForm({ title: "", description: "", finding_type: "fraud_indicator", severity: "high", financial_impact: "", recommendation: "" })
    load()
  }

  async function createTransaction(ev: any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an engagement first")
    setSaving(true)
    await fetch("/api/forensic/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...txForm, engagement_id: selectedEng, amount: Number(txForm.amount || 0) }) })
    setSaving(false)
    setTxForm({ transaction_date: "", description: "", party_from: "", party_to: "", amount: "", currency: "INR", account_from: "", account_to: "", transaction_ref: "", flag_type: "", flag_severity: "medium", is_flagged: false, investigator_notes: "" })
    load()
  }

  async function createInterview(ev: any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an engagement first")
    setSaving(true)
    await fetch("/api/forensic/interviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...interviewForm, engagement_id: selectedEng }) })
    setSaving(false)
    setInterviewForm({ interview_date: "", interviewee_name: "", interviewee_role: "", interviewee_org: "", conducted_by: "", location: "", interview_type: "in_person", key_findings: "", recording_consent: false, notes: "" })
    load()
  }

  async function createAML(ev: any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an engagement first")
    setSaving(true)
    await fetch("/api/forensic/aml", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...amlForm, engagement_id: selectedEng }) })
    setSaving(false)
    setAmlForm({ entity_name: "", entity_type: "individual", id_number: "", id_type: "pan", country: "India", pep_check: "not_checked", sanctions_check: "not_checked", adverse_media: "not_checked", checked_by: "", notes: "" })
    load()
  }

  async function runAI(type: string, data: any) {
    setAiLoading(true); setAiResult(null)
    const res = await fetch("/api/forensic/ai-analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, data }) })
    const result = await res.json()
    setAiResult({ type, ...result })
    setAiLoading(false)
  }

  const TABS = [
    { key: "engagements", label: "Engagements", count: stats.total },
    { key: "findings", label: "Findings", count: findings.length },
    { key: "transactions", label: "Transactions", count: transactions.length },
    { key: "interviews", label: "Interviews", count: interviews.length },
    { key: "aml", label: "AML / KYC", count: amlChecks.length },
    { key: "reports", label: "Reports", count: null },
  ]

  if (loading) return <div className="p-8 text-gray-400">Loading Forensic Audit...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forensic Audit</h1>
          <p className="text-sm text-gray-500 mt-0.5">ACFE · IIA · IFAC ISA 240 · FATF — Global Standard</p>
        </div>
        <div className="flex gap-2">
          <div className="text-xs text-gray-400 flex gap-4 items-center">
            <span className="text-red-600 font-medium">● {stats.critical || 0} Critical</span>
            <span className="text-amber-600 font-medium">◐ {stats.fieldwork || 0} In Progress</span>
            <span className="text-green-600 font-medium">✓ {stats.completed || 0} Completed</span>
          </div>
          <button onClick={() => setShowEngForm(s => !s)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
            + New Engagement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Engagements", value: stats.total || 0, color: "bg-blue-50 text-blue-900" },
          { label: "Active", value: (stats.planning || 0) + (stats.fieldwork || 0), color: "bg-amber-50 text-amber-900" },
          { label: "Findings", value: findings.filter(f => f.status === "open").length, color: "bg-red-50 text-red-900" },
          { label: "Flagged Txns", value: transactions.filter(t => t.is_flagged).length, color: "bg-orange-50 text-orange-900" },
          { label: "Total Fees", value: fmt(stats.totalFees || 0), color: "bg-green-50 text-green-900" },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4 border`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Engagement Selector */}
      {engagements.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-blue-800">Filter by engagement:</span>
          <div className="flex-1 max-w-md">
            <SearchableSelect
              options={[{ value: "", label: "All engagements" }, ...engOptions]}
              value={selectedEng}
              onChange={setSelectedEng}
              placeholder="Select engagement..."
            />
          </div>
          {selectedEng && (
            <Link href={`/in/ca/forensic/${selectedEng}`}
              className="text-xs px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100">
              Open Engagement →
            </Link>
          )}
        </div>
      )}

      {/* New Engagement Form */}
      {showEngForm && (
        <form onSubmit={createEngagement} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">New Forensic Audit Engagement</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Client / Entity Name *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={engForm.client_name} onChange={e => setEngForm({ ...engForm, client_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Engagement Type *</label>
              <SearchableSelect options={ENGAGEMENT_TYPES} value={engForm.engagement_type}
                onChange={val => setEngForm({ ...engForm, engagement_type: val })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Country</label>
              <SearchableSelect options={COUNTRIES.map(c => ({ value: c, label: c }))} value={engForm.country}
                onChange={val => setEngForm({ ...engForm, country: val })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Currency</label>
              <SearchableSelect options={CURRENCIES.map(c => ({ value: c, label: c }))} value={engForm.currency}
                onChange={val => setEngForm({ ...engForm, currency: val })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Standard</label>
              <SearchableSelect options={STANDARDS.map(s => ({ value: s, label: s }))} value={engForm.standard}
                onChange={val => setEngForm({ ...engForm, standard: val })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Risk Rating</label>
              <SearchableSelect
                options={["low","medium","high","critical"].map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                value={engForm.risk_rating} onChange={val => setEngForm({ ...engForm, risk_rating: val })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Period From</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={engForm.period_from} onChange={e => setEngForm({ ...engForm, period_from: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Period To</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={engForm.period_to} onChange={e => setEngForm({ ...engForm, period_to: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Lead Investigator</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={engForm.lead_investigator} onChange={e => setEngForm({ ...engForm, lead_investigator: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fee Estimate</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={engForm.fee_estimate} onChange={e => setEngForm({ ...engForm, fee_estimate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Estimated Hours</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={engForm.estimated_hours} onChange={e => setEngForm({ ...engForm, estimated_hours: e.target.value })} />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-gray-500 block mb-1">Scope of Engagement</label>
              <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Describe the scope, mandate and objectives..."
                value={engForm.scope} onChange={e => setEngForm({ ...engForm, scope: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">{saving ? "Creating..." : "Create Engagement"}</button>
            <button type="button" onClick={() => setShowEngForm(false)} className="px-5 py-2.5 border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5 ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
            {t.count !== null && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ENGAGEMENTS TAB */}
      {tab === "engagements" && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <tr>{["Ref No.", "Client", "Type", "Country", "Period", "Risk", "Status", "Fees", "Action"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {engagements.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No engagements yet — create your first forensic audit engagement above</td></tr>}
              {engagements.map(e => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-700 text-xs font-semibold">{e.engagement_no}</td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{e.client_name}</p><p className="text-xs text-gray-400">{e.standard}</p></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{ENGAGEMENT_TYPES.find(t => t.value === e.engagement_type)?.label || e.engagement_type}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{e.country}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.period_from || "—"} to {e.period_to || "—"}</td>
                  <td className="px-4 py-3">{severityBadge(e.risk_rating)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === "completed" ? "bg-green-50 text-green-700" : e.status === "fieldwork" ? "bg-blue-50 text-blue-700" : e.status === "suspended" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{e.fee_estimate ? fmt(e.fee_estimate, e.currency) : "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => { setSelectedEng(e.id); setTab("findings") }} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Open</button>
                    <button onClick={() => runAI("report_draft", e)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">AI Draft</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FINDINGS TAB */}
      {tab === "findings" && (
        <div className="space-y-4">
          <form onSubmit={createFinding} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Finding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Finding Title *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Fictitious vendor payments — XYZ Pvt Ltd"
                  value={findingForm.title} onChange={e => setFindingForm({ ...findingForm, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Finding Type</label>
                <SearchableSelect options={FINDING_TYPES.map(t => ({ value: t, label: t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))}
                  value={findingForm.finding_type} onChange={val => setFindingForm({ ...findingForm, finding_type: val })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Severity</label>
                <SearchableSelect options={["low","medium","high","critical"].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                  value={findingForm.severity} onChange={val => setFindingForm({ ...findingForm, severity: val })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Financial Impact</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={findingForm.financial_impact} onChange={e => setFindingForm({ ...findingForm, financial_impact: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Description *</label>
                <textarea rows={3} required className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  value={findingForm.description} onChange={e => setFindingForm({ ...findingForm, description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Recommendation</label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  value={findingForm.recommendation} onChange={e => setFindingForm({ ...findingForm, recommendation: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving || !selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving ? "Saving..." : "Add Finding"}</button>
              {findings.length > 0 && <button type="button" onClick={() => runAI("finding_analysis", findings)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100">🤖 AI Analyse All Findings</button>}
            </div>
          </form>

          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <tr>{["Ref", "Title", "Type", "Severity", "Financial Impact", "Status", "Rec"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {findings.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">{selectedEng ? "No findings yet for this engagement" : "Select an engagement to view findings"}</td></tr>}
                {findings.map(f => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-red-700">{f.finding_no}</td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{f.title}</p><p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{f.description}</p></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{f.finding_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">{severityBadge(f.severity)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{f.financial_impact ? fmt(f.financial_impact) : "—"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${f.status === "open" ? "bg-red-50 text-red-700" : f.status === "closed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{f.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{f.recommendation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {tab === "transactions" && (
        <div className="space-y-4">
          <form onSubmit={createTransaction} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Transaction for Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date *</label>
                <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.transaction_date} onChange={e => setTxForm({ ...txForm, transaction_date: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Description *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Party From</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.party_from} onChange={e => setTxForm({ ...txForm, party_from: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Party To</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.party_to} onChange={e => setTxForm({ ...txForm, party_to: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Account From</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.account_from} onChange={e => setTxForm({ ...txForm, account_from: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Account To</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.account_to} onChange={e => setTxForm({ ...txForm, account_to: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Transaction Ref</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.transaction_ref} onChange={e => setTxForm({ ...txForm, transaction_ref: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Flag Type</label>
                <SearchableSelect
                  options={[{ value: "", label: "No flag" }, ...FLAG_TYPES.map(f => ({ value: f, label: f.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))]}
                  value={txForm.flag_type} onChange={val => setTxForm({ ...txForm, flag_type: val, is_flagged: !!val })}
                  placeholder="Flag type..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Severity</label>
                <SearchableSelect options={["low","medium","high","critical"].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                  value={txForm.flag_severity} onChange={val => setTxForm({ ...txForm, flag_severity: val })} />
              </div>
              <div className="col-span-3">
                <label className="text-xs text-gray-500 block mb-1">Investigator Notes</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={txForm.investigator_notes} onChange={e => setTxForm({ ...txForm, investigator_notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving || !selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving ? "Saving..." : "Add Transaction"}</button>
              {transactions.length > 0 && <button type="button" onClick={() => runAI("transaction_pattern", transactions)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100">🤖 AI Pattern Analysis</button>}
            </div>
          </form>

          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <tr>{["Date", "Description", "From", "To", "Amount", "Flag", "Severity", "Status"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {transactions.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">{selectedEng ? "No transactions yet" : "Select an engagement"}</td></tr>}
                {transactions.map(t => (
                  <tr key={t.id} className={`border-t hover:bg-gray-50 ${t.is_flagged ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.transaction_date}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{t.party_from || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{t.party_to || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{t.amount ? fmt(t.amount, t.currency) : "—"}</td>
                    <td className="px-4 py-3">{t.flag_type ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">{t.flag_type.replace(/_/g, " ")}</span> : <span className="text-xs text-gray-400">Clear</span>}</td>
                    <td className="px-4 py-3">{t.is_flagged ? severityBadge(t.flag_severity) : "—"}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${t.status === "confirmed_suspicious" ? "bg-red-50 text-red-700" : t.status === "cleared" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{t.status?.replace(/_/g, " ")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERVIEWS TAB */}
      {tab === "interviews" && (
        <div className="space-y-4">
          <form onSubmit={createInterview} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Record Interview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date *</label>
                <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={interviewForm.interview_date} onChange={e => setInterviewForm({ ...interviewForm, interview_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Interviewee Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={interviewForm.interviewee_name} onChange={e => setInterviewForm({ ...interviewForm, interviewee_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Role / Designation</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={interviewForm.interviewee_role} onChange={e => setInterviewForm({ ...interviewForm, interviewee_role: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Organisation</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={interviewForm.interviewee_org} onChange={e => setInterviewForm({ ...interviewForm, interviewee_org: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Conducted By</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={interviewForm.conducted_by} onChange={e => setInterviewForm({ ...interviewForm, conducted_by: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Interview Type</label>
                <SearchableSelect
                  options={["in_person","virtual","phone"].map(t => ({ value: t, label: t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))}
                  value={interviewForm.interview_type} onChange={val => setInterviewForm({ ...interviewForm, interview_type: val })} />
              </div>
              <div className="col-span-3">
                <label className="text-xs text-gray-500 block mb-1">Key Findings / Statements</label>
                <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  value={interviewForm.key_findings} onChange={e => setInterviewForm({ ...interviewForm, key_findings: e.target.value })} />
              </div>
              <div className="col-span-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={interviewForm.recording_consent}
                    onChange={e => setInterviewForm({ ...interviewForm, recording_consent: e.target.checked })} />
                  <span className="text-sm text-gray-700">Interviewee consented to recording</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving || !selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving ? "Saving..." : "Save Interview"}</button>
              {interviews.length > 0 && <button type="button" onClick={() => runAI("interview_summary", interviews)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">🤖 AI Summarise Interviews</button>}
            </div>
          </form>

          <div className="space-y-3">
            {interviews.length === 0 && <p className="text-center text-gray-400 py-8">{selectedEng ? "No interviews recorded yet" : "Select an engagement"}</p>}
            {interviews.map(i => (
              <div key={i.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{i.interviewee_name}</p>
                    <p className="text-xs text-gray-500">{i.interviewee_role} · {i.interviewee_org} · {i.interview_date}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{i.interview_type?.replace(/_/g, " ")}</span>
                    {i.recording_consent && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Consent ✓</span>}
                  </div>
                </div>
                {i.key_findings && <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{i.key_findings}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AML TAB */}
      {tab === "aml" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">AML/KYC Screening — FATF Recommendations</p>
            <p className="text-xs">CDD (Customer Due Diligence) required for all engagement parties per FATF Recommendations 10-12. PEP (Politically Exposed Person) and Sanctions screening mandatory. Upgrade to LexisNexis Bridger Insight for automated global watchlist screening.</p>
          </div>

          <form onSubmit={createAML} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Screen Entity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Entity Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={amlForm.entity_name} onChange={e => setAmlForm({ ...amlForm, entity_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Entity Type</label>
                <SearchableSelect options={["individual","company","trust","partnership"].map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                  value={amlForm.entity_type} onChange={val => setAmlForm({ ...amlForm, entity_type: val })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Country</label>
                <SearchableSelect options={COUNTRIES.map(c => ({ value: c, label: c }))}
                  value={amlForm.country} onChange={val => setAmlForm({ ...amlForm, country: val })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">ID Type</label>
                <SearchableSelect options={["pan","aadhaar","passport","company_reg","gstin","tin"].map(t => ({ value: t, label: t.toUpperCase() }))}
                  value={amlForm.id_type} onChange={val => setAmlForm({ ...amlForm, id_type: val })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">ID Number</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  value={amlForm.id_number} onChange={e => setAmlForm({ ...amlForm, id_number: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Checked By</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={amlForm.checked_by} onChange={e => setAmlForm({ ...amlForm, checked_by: e.target.value })} />
              </div>
              {[
                { key: "pep_check", label: "PEP Check" },
                { key: "sanctions_check", label: "Sanctions Check" },
                { key: "adverse_media", label: "Adverse Media" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 block mb-1">{field.label}</label>
                  <SearchableSelect
                    options={["not_checked","clear","match_found","review_required"].map(v => ({ value: v, label: v.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))}
                    value={(amlForm as any)[field.key]}
                    onChange={val => setAmlForm({ ...amlForm, [field.key]: val })} />
                </div>
              ))}
              <div className="col-span-3">
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={amlForm.notes} onChange={e => setAmlForm({ ...amlForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving || !selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving ? "Screening..." : "Run Screen"}</button>
              {amlChecks.length > 0 && <button type="button" onClick={() => runAI("aml_risk", amlChecks)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">🤖 AI Risk Assessment</button>}
            </div>
          </form>

          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <tr>{["Entity", "Type", "Country", "ID", "PEP", "Sanctions", "Media", "Risk", "Screened By"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {amlChecks.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No AML checks yet</td></tr>}
                {amlChecks.map(a => {
                  const checkBadge = (v: string) => v === "clear" ? <span className="text-green-600 text-xs">✓ Clear</span> : v === "match_found" ? <span className="text-red-600 font-bold text-xs">⚠ Match</span> : v === "review_required" ? <span className="text-amber-600 text-xs">! Review</span> : <span className="text-gray-400 text-xs">Not checked</span>
                  return (
                    <tr key={a.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.entity_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{a.entity_type}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{a.country}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">{a.id_number ? `${a.id_type?.toUpperCase()}: ${a.id_number}` : "—"}</td>
                      <td className="px-4 py-3">{checkBadge(a.pep_check)}</td>
                      <td className="px-4 py-3">{checkBadge(a.sanctions_check)}</td>
                      <td className="px-4 py-3">{checkBadge(a.adverse_media)}</td>
                      <td className="px-4 py-3">{severityBadge(a.risk_level)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.checked_by || "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Generate Forensic Report</h3>
            {!selectedEng ? (
              <p className="text-gray-400 text-sm">Select an engagement above to generate a report</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Engagement", value: engagements.find(e => e.id === selectedEng)?.engagement_no },
                    { label: "Client", value: engagements.find(e => e.id === selectedEng)?.client_name },
                    { label: "Total Findings", value: findings.length },
                    { label: "Critical Findings", value: findings.filter(f => f.severity === "critical").length },
                    { label: "Flagged Transactions", value: transactions.filter(t => t.is_flagged).length },
                    { label: "Total Financial Impact", value: fmt(findings.reduce((s, f) => s + Number(f.financial_impact || 0), 0)) },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between border-b py-2">
                      <span className="text-sm text-gray-500">{s.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => runAI("report_draft", { engagement: engagements.find(e => e.id === selectedEng), findings, transactions, interviews, amlChecks })}
                    disabled={aiLoading} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {aiLoading ? "Generating..." : "🤖 AI Draft Executive Summary"}
                  </button>
                  <span className="text-xs text-gray-400 self-center">Powered by Groq · Follows ACFE/IIA standards · Privileged & Confidential</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI RESULT PANEL */}
      {(aiLoading || aiResult) && (
        <div className="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-sm">🤖 AI Forensic Analysis</p>
            {aiResult && <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-white text-xs">✕ Close</button>}
          </div>
          {aiLoading && <p className="animate-pulse">Analysing with AI...</p>}
          {aiResult?.result && (
            <div className="space-y-2">
              {Object.entries(aiResult.result).map(([key, val]) => (
                <div key={key}>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                  <div className="text-green-300 mt-0.5 bg-gray-800 rounded p-2">
                    {Array.isArray(val) ? (
                      <ul className="space-y-0.5 list-disc list-inside">
                        {(val as any[]).map((item, i) => <li key={i}>{String(item)}</li>)}
                      </ul>
                    ) : (
                      <p>{String(val)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
