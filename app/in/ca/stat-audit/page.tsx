"use client"
import { useEffect, useState, useCallback } from "react"
import SearchableSelect from "@/components/SearchableSelect"

const AUDIT_TYPES = [
  { value: "statutory_audit", label: "Statutory Audit (Companies Act)" },
  { value: "tax_audit", label: "Tax Audit (Sec 44AB)" },
  { value: "internal_audit", label: "Internal Audit" },
  { value: "bank_audit", label: "Bank Branch Audit" },
  { value: "concurrent_audit", label: "Concurrent Audit" },
  { value: "stock_audit", label: "Stock Audit" },
  { value: "system_audit", label: "Information System Audit" },
  { value: "ngo_audit", label: "NGO / Trust Audit" },
  { value: "cost_audit", label: "Cost Audit" },
]
const RISK_CATEGORIES = [
  { value: "financial_reporting", label: "Financial Reporting" },
  { value: "compliance", label: "Regulatory Compliance" },
  { value: "operational", label: "Operational" },
  { value: "it_systems", label: "IT / Systems" },
  { value: "fraud", label: "Fraud Risk" },
  { value: "related_party", label: "Related Party" },
  { value: "going_concern", label: "Going Concern" },
  { value: "revenue_recognition", label: "Revenue Recognition" },
]
const CONTROL_TYPES = [
  { value: "preventive", label: "Preventive" },
  { value: "detective", label: "Detective" },
  { value: "corrective", label: "Corrective" },
  { value: "directive", label: "Directive" },
]
const ICFR_AREAS = [
  "Revenue & Receivables","Purchases & Payables","Payroll & HR",
  "Fixed Assets","Inventory","Treasury & Banking","Tax Compliance",
  "Financial Close & Reporting","IT General Controls","Entity Level Controls"
]
const CHECKLIST_ITEMS: Record<string, string[]> = {
  statutory_audit: [
    "Verify share capital and reserves — MOA/AOA compliance",
    "Review statutory registers (members, directors, charges)",
    "Check board/AGM minutes for major decisions",
    "Verify fixed asset register and physical verification",
    "Confirm bank balances with certificates",
    "Test debtors — circularisation / aging analysis",
    "Test creditors — confirmation / reconciliation",
    "Review inventory valuation method consistency",
    "Check loans/advances — related party disclosure",
    "Verify compliance with Ind AS / AS",
    "Check CARO 2020 reporting requirements",
    "Verify auditor's independence — SA 200",
    "Assess going concern — SA 570",
    "Review subsequent events — SA 560",
  ],
  tax_audit: [
    "Verify gross receipts/turnover for Sec 44AB applicability",
    "Check Method of Accounting — Sec 145",
    "Verify opening stock valuation",
    "Test purchases — Form 3CD Clause 18",
    "Test payments exceeding ₹10,000 cash — Sec 40A(3)",
    "Check TDS deduction and deposit — Sec 40(a)(ia)",
    "Verify Sec 43B deductions — bonus, PF, tax paid",
    "Check deemed dividend — Sec 2(22)(e)",
    "Verify MAT / AMT computation",
    "Review ICDS compliance and adjustments",
    "Check Form 26AS reconciliation with books",
    "Verify brought forward losses — Sec 72/73",
    "Check MSME payments — 43B(h) compliance",
  ],
  internal_audit: [
    "Assess adequacy of internal control framework",
    "Test segregation of duties — key processes",
    "Review purchase order process — authorization limits",
    "Test payment authorization — dual control",
    "Review vendor master changes — access control",
    "Test payroll — ghost employee check",
    "Verify expense claims — policy compliance",
    "Review IT access controls — privileged users",
    "Test physical access — server room / cash vault",
    "Review contract management — completeness",
    "Assess business continuity / DR plan",
    "Review compliance management framework",
    "Test petty cash — surprise count",
    "Review MIS reports — accuracy and timeliness",
  ],
  bank_audit: [
    "Verify NPA classification as per RBI guidelines",
    "Check provisioning adequacy — NPA / standard assets",
    "Verify KYC compliance for new accounts",
    "Test loan disbursements — documentation completeness",
    "Check interest income computation — NPA vs standard",
    "Verify cash and cash equivalents — surprise count",
    "Review large borrowal accounts — evergreening check",
    "Check CIBIL / credit bureau verification",
    "Verify forex transactions — FEMA compliance",
    "Review fraud register — RBI reporting compliance",
  ],
  concurrent_audit: [
    "Daily verification of transactions above threshold",
    "Check loan disbursement vs sanction terms",
    "Verify cash transaction limits — ₹50,000 rule",
    "Test KYC documentation for new accounts",
    "Review overdue accounts — follow-up status",
    "Verify EOD balancing and reconciliation",
    "Check revenue leakage — fee/charge collection",
    "Review suspense account entries and clearance",
  ],
}

function Badge({ s, map }: { s: string; map?: Record<string,string> }) {
  const cls = map?.[s] || (
    s==="critical"||s==="high" ? "bg-red-100 text-red-800 border border-red-200" :
    s==="medium" ? "bg-amber-100 text-amber-800 border border-amber-200" :
    s==="low" ? "bg-green-100 text-green-800 border border-green-200" :
    "bg-gray-100 text-gray-700"
  )
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{s?.replace(/_/g," ")}</span>
}

export default function StatAuditPage() {
  type TabKey = "engagements"|"risk_matrix"|"checklist"|"icfr"|"sampling"|"observations"|"report"
  const [tab, setTab] = useState<TabKey>("engagements")
  const [engagements, setEngagements] = useState<any[]>([])
  const [selectedEng, setSelectedEng] = useState<string>("")
  const [risks, setRisks] = useState<any[]>([])
  const [icfr, setIcfr] = useState<any[]>([])
  const [observations, setObservations] = useState<any[]>([])
  const [checklist, setChecklist] = useState<Record<string,boolean>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [showEngForm, setShowEngForm] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportHtml, setReportHtml] = useState<string>("")

  const [population, setPopulation] = useState(1000)
  const [confidence, setConfidence] = useState<95|90|99>(95)
  const [tolerable, setTolerable] = useState(5)
  const [expected, setExpected] = useState(2)

  const [engForm, setEngForm] = useState({
    client_name:"", audit_type:"statutory_audit", fy:"", period_from:"", period_to:"",
    partner:"", manager:"", standard:"SA 200", risk_level:"medium", notes:""
  })
  const [riskForm, setRiskForm] = useState({
    risk_area:"", category:"financial_reporting", description:"",
    inherent_risk:"medium", control_risk:"medium", detection_risk:"medium",
    control_type:"preventive", control_description:"", control_effective:"not_tested", audit_response:""
  })
  const [icfrForm, setIcfrForm] = useState({
    process_area:"Revenue & Receivables", control_objective:"", control_description:"",
    control_type:"preventive", frequency:"monthly", owner:"",
    test_procedure:"", sample_size:"25", result:"not_tested", deficiency_type:"", remarks:""
  })
  const [obsForm, setObsForm] = useState({
    area:"", observation:"", risk_implication:"", recommendation:"",
    management_comment:"", severity:"medium", status:"open"
  })

  const load = useCallback(async () => {
    const r = await fetch("/api/stat-audit/engagements").then(r=>r.json()).catch(()=>({engagements:[]}))
    setEngagements(r.engagements||[])
    if (selectedEng) {
      const [rr,ir,or_] = await Promise.all([
        fetch(`/api/stat-audit/risks?engagement_id=${selectedEng}`).then(r=>r.json()).catch(()=>[]),
        fetch(`/api/stat-audit/icfr?engagement_id=${selectedEng}`).then(r=>r.json()).catch(()=>[]),
        fetch(`/api/stat-audit/observations?engagement_id=${selectedEng}`).then(r=>r.json()).catch(()=>[]),
      ])
      setRisks(Array.isArray(rr)?rr:[])
      setIcfr(Array.isArray(ir)?ir:[])
      setObservations(Array.isArray(or_)?or_:[])
    }
    setLoading(false)
  }, [selectedEng])

  useEffect(()=>{ load() },[load])

  const z = confidence===99?2.576:confidence===95?1.96:1.645
  const sampleSize = Math.ceil(
    (population*z**2*(tolerable/100)*(1-tolerable/100)) /
    (((tolerable-expected)/100)**2*population + z**2*(tolerable/100)*(1-tolerable/100))
  )

  const riskScore = (r:any) => {
    const m:Record<string,number>={low:1,medium:2,high:3,critical:4}
    return (m[r.inherent_risk]||2)*(m[r.control_risk]||2)*(m[r.detection_risk]||2)
  }
  const riskLabel = (s:number) => s<=4?"low":s<=8?"medium":s<=18?"high":"critical"

  const selectedEngData = engagements.find(e=>e.id===selectedEng)
  const checklistItems = CHECKLIST_ITEMS[selectedEngData?.audit_type||"statutory_audit"]||CHECKLIST_ITEMS.statutory_audit
  const checklistProgress = checklistItems.filter((_,i)=>checklist[i]).length

  async function createEngagement(ev:any) {
    ev.preventDefault(); setSaving(true)
    await fetch("/api/stat-audit/engagements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(engForm)}).catch(()=>{})
    setSaving(false); setShowEngForm(false); load()
  }
  async function createRisk(ev:any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an audit first")
    setSaving(true)
    await fetch("/api/stat-audit/risks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...riskForm,engagement_id:selectedEng})}).catch(()=>{})
    setSaving(false)
    setRiskForm({risk_area:"",category:"financial_reporting",description:"",inherent_risk:"medium",control_risk:"medium",detection_risk:"medium",control_type:"preventive",control_description:"",control_effective:"not_tested",audit_response:""})
    load()
  }
  async function createIcfr(ev:any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an audit first")
    setSaving(true)
    await fetch("/api/stat-audit/icfr",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...icfrForm,engagement_id:selectedEng})}).catch(()=>{})
    setSaving(false)
    setIcfrForm({process_area:"Revenue & Receivables",control_objective:"",control_description:"",control_type:"preventive",frequency:"monthly",owner:"",test_procedure:"",sample_size:"25",result:"not_tested",deficiency_type:"",remarks:""})
    load()
  }
  async function createObservation(ev:any) {
    ev.preventDefault()
    if (!selectedEng) return alert("Select an audit first")
    setSaving(true)
    await fetch("/api/stat-audit/observations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...obsForm,engagement_id:selectedEng})}).catch(()=>{})
    setSaving(false)
    setObsForm({area:"",observation:"",risk_implication:"",recommendation:"",management_comment:"",severity:"medium",status:"open"})
    load()
  }
  async function runAI(type:string,data:any) {
    setAiLoading(true); setAiResult(null)
    const res = await fetch("/api/forensic/ai-analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,data})}).catch(()=>null)
    if (res) setAiResult({type,...await res.json()})
    setAiLoading(false)
  }
  async function generateReport() {
    if (!selectedEng) return
    setReportLoading(true); setReportHtml("")
    const res = await fetch("/api/stat-audit/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({engagement:selectedEngData,risks,icfr,observations,checklist:checklistItems.filter((_,i)=>checklist[i]),checklistProgress,checklistTotal:checklistItems.length})}).catch(()=>null)
    if (res) { const {html}=await res.json(); setReportHtml(html||"") }
    setReportLoading(false)
  }
  function printReport() {
    const w=window.open("","_blank"); if(!w) return
    w.document.write(reportHtml); w.document.close(); w.focus(); w.print()
  }

  const TABS:{key:TabKey;label:string;count?:number}[] = [
    {key:"engagements", label:"Engagements",    count:engagements.length},
    {key:"risk_matrix", label:"Risk Matrix",     count:risks.length},
    {key:"checklist",   label:"Checklist",       count:checklistProgress},
    {key:"icfr",        label:"ICFR / Controls", count:icfr.length},
    {key:"sampling",    label:"Sampling"},
    {key:"observations",label:"Observations",   count:observations.length},
    {key:"report",      label:"Report"},
  ]

  if (loading) return <div className="p-8 text-gray-400">Loading Stat & Internal Audit...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200 uppercase tracking-wide">Paid Module</span>
            <span className="text-xs text-gray-400">SA 200 · SA 315 · SA 530 · ICAI Standards · Companies Act 2013</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Stat &amp; Internal Audit</h1>
          <p className="text-sm text-gray-500 mt-0.5">Risk-based audit · ICFR testing · Statistical sampling · Observation register · Audit report</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs flex gap-4">
            <span className="text-red-600 font-medium">● {observations.filter(o=>o.severity==="high"||o.severity==="critical").length} High risk</span>
            <span className="text-amber-600 font-medium">◐ {icfr.filter(c=>c.result==="deficient").length} Deficiencies</span>
            <span className="text-green-600 font-medium">✓ {observations.filter(o=>o.status==="closed").length} Closed</span>
          </div>
          <button onClick={()=>setShowEngForm(s=>!s)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">+ New Audit</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          {label:"Audits",           value:engagements.length,                                          cls:"bg-slate-50"},
          {label:"High risks",       value:risks.filter(r=>riskLabel(riskScore(r))==="high"||riskLabel(riskScore(r))==="critical").length, cls:"bg-red-50"},
          {label:"Controls tested",  value:icfr.filter(c=>c.result!=="not_tested").length,              cls:"bg-blue-50"},
          {label:"Deficiencies",     value:icfr.filter(c=>c.result==="deficient").length,               cls:"bg-orange-50"},
          {label:"Open obs",         value:observations.filter(o=>o.status==="open").length,            cls:"bg-amber-50"},
        ].map(c=>(
          <div key={c.label} className={`${c.cls} rounded-xl p-3 border`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {engagements.length>0&&(
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-purple-800 shrink-0">Active audit:</span>
          <div className="flex-1 max-w-md">
            <SearchableSelect
              options={[{value:"",label:"All audits"},...engagements.map(e=>({value:e.id,label:`${e.engagement_no||e.id.slice(0,8)} — ${e.client_name}`,sub:`${AUDIT_TYPES.find(a=>a.value===e.audit_type)?.label} · FY ${e.fy}`}))]}
              value={selectedEng} onChange={setSelectedEng} placeholder="Select audit..."/>
          </div>
          {selectedEng&&(
            <button onClick={()=>{setTab("report");generateReport()}} className="text-xs px-3 py-1.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800">📄 Generate Report</button>
          )}
        </div>
      )}

      {showEngForm&&(
        <form onSubmit={createEngagement} className="bg-white border rounded-xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Stat / Internal Audit</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-500 block mb-1">Client / Entity *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={engForm.client_name} onChange={e=>setEngForm({...engForm,client_name:e.target.value})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Audit Type *</label><SearchableSelect options={AUDIT_TYPES} value={engForm.audit_type} onChange={val=>setEngForm({...engForm,audit_type:val})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Financial Year</label><input placeholder="2024-25" className="w-full border rounded-lg px-3 py-2 text-sm" value={engForm.fy} onChange={e=>setEngForm({...engForm,fy:e.target.value})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Period From</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={engForm.period_from} onChange={e=>setEngForm({...engForm,period_from:e.target.value})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Period To</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={engForm.period_to} onChange={e=>setEngForm({...engForm,period_to:e.target.value})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Risk Level</label><SearchableSelect options={["low","medium","high","critical"].map(r=>({value:r,label:r.charAt(0).toUpperCase()+r.slice(1)}))} value={engForm.risk_level} onChange={val=>setEngForm({...engForm,risk_level:val})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Signing Partner</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={engForm.partner} onChange={e=>setEngForm({...engForm,partner:e.target.value})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Audit Manager</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={engForm.manager} onChange={e=>setEngForm({...engForm,manager:e.target.value})}/></div>
            <div><label className="text-xs text-gray-500 block mb-1">Standard</label><SearchableSelect options={["SA 200","SA 315","SA 530","IIA Standards","COSO"].map(s=>({value:s,label:s}))} value={engForm.standard} onChange={val=>setEngForm({...engForm,standard:val})}/></div>
            <div className="col-span-3"><label className="text-xs text-gray-500 block mb-1">Notes / Scope</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" value={engForm.notes} onChange={e=>setEngForm({...engForm,notes:e.target.value})}/></div>
          </div>
          <div className="flex gap-2">
            <button disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm">{saving?"Creating...":"Create Audit"}</button>
            <button type="button" onClick={()=>setShowEngForm(false)} className="px-5 py-2.5 border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="border-b flex gap-0 overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px whitespace-nowrap flex items-center gap-1 ${tab===t.key?"border-gray-900 text-gray-900":"border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
            {t.count!=null&&<span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab==="engagements"&&(
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <tr>{["Ref","Client","Audit Type","FY","Period","Partner","Risk","Status"].map(h=><th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {engagements.length===0&&<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No audits yet — create your first stat or internal audit above</td></tr>}
              {engagements.map(e=>(
                <tr key={e.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={()=>{setSelectedEng(e.id);setTab("risk_matrix")}}>
                  <td className="px-4 py-3 font-mono text-purple-700 text-xs font-semibold">{e.engagement_no||e.id?.slice(0,8)}</td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{e.client_name}</p><p className="text-xs text-gray-400">{e.standard}</p></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{AUDIT_TYPES.find(a=>a.value===e.audit_type)?.label||e.audit_type}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{e.fy||"—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.period_from||"—"} → {e.period_to||"—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{e.partner||"—"}</td>
                  <td className="px-4 py-3"><Badge s={e.risk_level||"medium"}/></td>
                  <td className="px-4 py-3"><Badge s={e.status||"planning"} map={{completed:"bg-green-50 text-green-700",fieldwork:"bg-blue-50 text-blue-700",planning:"bg-amber-50 text-amber-700"}}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="risk_matrix"&&(
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-0.5">Risk Assessment Matrix — SA 315</p>
            <p className="text-xs">Audit Risk = Inherent Risk × Control Risk × Detection Risk. Score ≥18=critical · 9-17=high · 4-8=medium · &lt;4=low</p>
          </div>
          <form onSubmit={createRisk} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Risk Area</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1">Risk Area *</label><input required placeholder="e.g. Revenue — fictitious sales" className="w-full border rounded-lg px-3 py-2 text-sm" value={riskForm.risk_area} onChange={e=>setRiskForm({...riskForm,risk_area:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Category</label><SearchableSelect options={RISK_CATEGORIES} value={riskForm.category} onChange={val=>setRiskForm({...riskForm,category:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Inherent Risk</label><SearchableSelect options={["low","medium","high","critical"].map(r=>({value:r,label:r.charAt(0).toUpperCase()+r.slice(1)}))} value={riskForm.inherent_risk} onChange={val=>setRiskForm({...riskForm,inherent_risk:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Control Risk</label><SearchableSelect options={["low","medium","high","critical"].map(r=>({value:r,label:r.charAt(0).toUpperCase()+r.slice(1)}))} value={riskForm.control_risk} onChange={val=>setRiskForm({...riskForm,control_risk:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Detection Risk</label><SearchableSelect options={["low","medium","high","critical"].map(r=>({value:r,label:r.charAt(0).toUpperCase()+r.slice(1)}))} value={riskForm.detection_risk} onChange={val=>setRiskForm({...riskForm,detection_risk:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Risk Score</label>
                <div className={`border rounded-lg px-3 py-2 text-sm font-bold font-mono ${(()=>{const m:Record<string,number>={low:1,medium:2,high:3,critical:4};const s=(m[riskForm.inherent_risk]||2)*(m[riskForm.control_risk]||2)*(m[riskForm.detection_risk]||2);return s>=18?"bg-red-50 text-red-700":s>=9?"bg-orange-50 text-orange-700":s>=4?"bg-amber-50 text-amber-700":"bg-green-50 text-green-700"})()}`}>
                  {(()=>{const m:Record<string,number>={low:1,medium:2,high:3,critical:4};return(m[riskForm.inherent_risk]||2)*(m[riskForm.control_risk]||2)*(m[riskForm.detection_risk]||2)})()}
                </div>
              </div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Description / Assertion</label><input placeholder="e.g. Management may overstate revenue — completeness and occurrence assertions" className="w-full border rounded-lg px-3 py-2 text-sm" value={riskForm.description} onChange={e=>setRiskForm({...riskForm,description:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Control Effective?</label><SearchableSelect options={[{value:"yes",label:"Yes — effective"},{value:"no",label:"No — deficient"},{value:"not_tested",label:"Not tested"}]} value={riskForm.control_effective} onChange={val=>setRiskForm({...riskForm,control_effective:val})}/></div>
              <div className="col-span-3"><label className="text-xs text-gray-500 block mb-1">Audit Response / Procedures planned</label><input placeholder="e.g. Debtors circularisation, cut-off testing, analytical procedures" className="w-full border rounded-lg px-3 py-2 text-sm" value={riskForm.audit_response} onChange={e=>setRiskForm({...riskForm,audit_response:e.target.value})}/></div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving||!selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving?"Adding...":"Add to Risk Matrix"}</button>
              {risks.length>0&&<button type="button" onClick={()=>runAI("risk_assessment",risks)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">🤖 AI Risk Analysis</button>}
            </div>
          </form>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b"><tr>{["Risk Area","Category","IR","CR","DR","Score","Overall","Audit Response","Control"].map(h=><th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {risks.length===0&&<tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">{selectedEng?"No risks assessed yet":"Select an audit"}</td></tr>}
                {risks.map(r=>{
                  const score=riskScore(r)
                  return(
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-3"><p className="font-medium text-gray-900 text-xs">{r.risk_area}</p><p className="text-xs text-gray-400 line-clamp-1">{r.description}</p></td>
                      <td className="px-3 py-3 text-xs text-gray-600">{RISK_CATEGORIES.find(c=>c.value===r.category)?.label||r.category}</td>
                      <td className="px-3 py-3"><Badge s={r.inherent_risk}/></td>
                      <td className="px-3 py-3"><Badge s={r.control_risk}/></td>
                      <td className="px-3 py-3"><Badge s={r.detection_risk}/></td>
                      <td className="px-3 py-3 font-mono font-bold text-gray-800">{score}</td>
                      <td className="px-3 py-3"><Badge s={riskLabel(score)}/></td>
                      <td className="px-3 py-3 text-xs text-gray-500 max-w-xs truncate">{r.audit_response||"—"}</td>
                      <td className="px-3 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.control_effective==="yes"?"bg-green-50 text-green-700":r.control_effective==="no"?"bg-red-50 text-red-700":"bg-gray-100 text-gray-600"}`}>{r.control_effective==="yes"?"✓ Effective":r.control_effective==="no"?"✗ Deficient":"Not tested"}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="checklist"&&(
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">{AUDIT_TYPES.find(a=>a.value===selectedEngData?.audit_type)?.label||"Statutory Audit"} — Standard Checklist</h3>
                <p className="text-xs text-gray-400 mt-0.5">ICAI standard procedures · Tick off as completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{checklistProgress}/{checklistItems.length}</p>
                <p className="text-xs text-gray-400">completed</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{width:`${checklistItems.length?(checklistProgress/checklistItems.length)*100:0}%`}}/>
            </div>
            <div className="space-y-1">
              {checklistItems.map((item,i)=>(
                <label key={i} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${checklist[i]?"bg-green-50":""}`}>
                  <input type="checkbox" className="mt-0.5 accent-green-600" checked={!!checklist[i]} onChange={e=>setChecklist(c=>({...c,[i]:e.target.checked}))}/>
                  <span className={`text-sm ${checklist[i]?"line-through text-gray-400":"text-gray-700"}`}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="icfr"&&(
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-0.5">ICFR — Internal Controls over Financial Reporting</p>
            <p className="text-xs">Test key controls per financial reporting process. Record design adequacy, operating effectiveness, and deficiency classification (significant deficiency / material weakness).</p>
          </div>
          <form onSubmit={createIcfr} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Control Test</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1">Process Area</label><SearchableSelect options={ICFR_AREAS.map(a=>({value:a,label:a}))} value={icfrForm.process_area} onChange={val=>setIcfrForm({...icfrForm,process_area:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Control Type</label><SearchableSelect options={CONTROL_TYPES} value={icfrForm.control_type} onChange={val=>setIcfrForm({...icfrForm,control_type:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Frequency</label><SearchableSelect options={["daily","weekly","monthly","quarterly","annual","transaction_level"].map(f=>({value:f,label:f.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}))} value={icfrForm.frequency} onChange={val=>setIcfrForm({...icfrForm,frequency:val})}/></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Control Objective *</label><input required placeholder="e.g. All sales are real, authorised and recorded in the correct period" className="w-full border rounded-lg px-3 py-2 text-sm" value={icfrForm.control_objective} onChange={e=>setIcfrForm({...icfrForm,control_objective:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Control Owner</label><input placeholder="e.g. CFO" className="w-full border rounded-lg px-3 py-2 text-sm" value={icfrForm.owner} onChange={e=>setIcfrForm({...icfrForm,owner:e.target.value})}/></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Test Procedure</label><input placeholder="e.g. Inspect 25 sales invoices for dual approval" className="w-full border rounded-lg px-3 py-2 text-sm" value={icfrForm.test_procedure} onChange={e=>setIcfrForm({...icfrForm,test_procedure:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Sample Size</label><SearchableSelect options={["5","10","15","25","40","60"].map(n=>({value:n,label:`${n} items`}))} value={icfrForm.sample_size} onChange={val=>setIcfrForm({...icfrForm,sample_size:val})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Result</label><SearchableSelect options={[{value:"not_tested",label:"Not tested"},{value:"effective",label:"Effective — no exceptions"},{value:"exceptions_noted",label:"Exceptions noted"},{value:"deficient",label:"Deficient — redesign needed"}]} value={icfrForm.result} onChange={val=>setIcfrForm({...icfrForm,result:val})}/></div>
              {icfrForm.result!=="not_tested"&&icfrForm.result!=="effective"&&(
                <div><label className="text-xs text-gray-500 block mb-1">Deficiency Type</label><SearchableSelect options={[{value:"control_deficiency",label:"Control Deficiency"},{value:"significant_deficiency",label:"Significant Deficiency"},{value:"material_weakness",label:"Material Weakness"}]} value={icfrForm.deficiency_type} onChange={val=>setIcfrForm({...icfrForm,deficiency_type:val})}/></div>
              )}
              {icfrForm.result!=="effective"&&<div className="col-span-3"><label className="text-xs text-gray-500 block mb-1">Remarks / Exceptions</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={icfrForm.remarks} onChange={e=>setIcfrForm({...icfrForm,remarks:e.target.value})}/></div>}
            </div>
            <div className="flex gap-2">
              <button disabled={saving||!selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving?"Saving...":"Save Control Test"}</button>
              {icfr.length>0&&<button type="button" onClick={()=>runAI("icfr_analysis",icfr)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">🤖 AI ICFR Summary</button>}
            </div>
          </form>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b"><tr>{["Process","Objective","Type","Owner","Sample","Result","Deficiency"].map(h=><th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {icfr.length===0&&<tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">{selectedEng?"No controls tested yet":"Select an audit"}</td></tr>}
                {icfr.map(c=>(
                  <tr key={c.id} className={`border-t hover:bg-gray-50 ${c.result==="deficient"?"bg-red-50/30":""}`}>
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{c.process_area}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{c.control_objective}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.control_type}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.owner||"—"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{c.sample_size}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.result==="effective"?"bg-green-50 text-green-700":c.result==="deficient"?"bg-red-50 text-red-700":c.result==="exceptions_noted"?"bg-amber-50 text-amber-700":"bg-gray-100 text-gray-600"}`}>{c.result?.replace(/_/g," ")}</span></td>
                    <td className="px-4 py-3 text-xs text-red-700 font-medium">{c.deficiency_type?.replace(/_/g," ")||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="sampling"&&(
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-700">Statistical sample size calculator — SA 530 / MUS</h3>
            <div className="grid grid-cols-4 gap-6">
              <div><label className="text-xs text-gray-500 block mb-1">Population (items)</label><input type="number" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={population} onChange={e=>setPopulation(Number(e.target.value))}/></div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Confidence level</label>
                <div className="flex gap-2">
                  {([90,95,99] as const).map(c=>(
                    <button key={c} type="button" onClick={()=>setConfidence(c)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${confidence===c?"bg-gray-900 text-white border-gray-900":"border-gray-200 hover:bg-gray-50"}`}>{c}%</button>
                  ))}
                </div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Tolerable error (%)</label><input type="number" min={1} max={50} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={tolerable} onChange={e=>setTolerable(Number(e.target.value))}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Expected error (%)</label><input type="number" min={0} max={tolerable-1} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={expected} onChange={e=>setExpected(Number(e.target.value))}/></div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs text-purple-600 mb-1">Recommended sample size</p>
                <p className="text-5xl font-bold text-purple-900">{isNaN(sampleSize)||!isFinite(sampleSize)?"—":Math.min(sampleSize,population)}</p>
                <p className="text-xs text-purple-500 mt-1">items</p>
              </div>
              <div className="flex-1 space-y-1.5 text-sm text-purple-800">
                <p>• Confidence: <strong>{confidence}%</strong> (z = {z})</p>
                <p>• Tolerable error: <strong>{tolerable}%</strong></p>
                <p>• Expected error: <strong>{expected}%</strong></p>
                <p>• Sampling risk: <strong>{100-confidence}%</strong></p>
                <p className="text-xs text-purple-500 mt-2">Per ICAI SA 530 — Audit Sampling</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-600 mb-1">Coverage</p>
                <p className="text-2xl font-bold text-purple-900">{population?Math.round((Math.min(sampleSize,population)/population)*100):0}%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Random sampling</p><p className="text-gray-800">Use RAND() in Excel or a random number table. Select items matching generated numbers.</p></div>
              <div className="border rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Systematic sampling</p><p className="text-gray-800">Interval = <strong>{population&&sampleSize?Math.round(population/Math.min(sampleSize,population)):"—"}</strong>. Pick a random start, then every nth item.</p></div>
              <div className="border rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Haphazard selection</p><p className="text-gray-800">No deliberate pattern. Document selection basis clearly in working papers.</p></div>
            </div>
          </div>
        </div>
      )}

      {tab==="observations"&&(
        <div className="space-y-4">
          <form onSubmit={createObservation} className="bg-white border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Audit Observation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1">Area / Process *</label><input required placeholder="e.g. Fixed Assets — Physical Verification" className="w-full border rounded-lg px-3 py-2 text-sm" value={obsForm.area} onChange={e=>setObsForm({...obsForm,area:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Severity</label><SearchableSelect options={["low","medium","high","critical"].map(s=>({value:s,label:s.charAt(0).toUpperCase()+s.slice(1)}))} value={obsForm.severity} onChange={val=>setObsForm({...obsForm,severity:val})}/></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Observation *</label><textarea required rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Describe what was found, evidence examined, exceptions noted..." value={obsForm.observation} onChange={e=>setObsForm({...obsForm,observation:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Risk Implication</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" value={obsForm.risk_implication} onChange={e=>setObsForm({...obsForm,risk_implication:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Recommendation</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" value={obsForm.recommendation} onChange={e=>setObsForm({...obsForm,recommendation:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Management Comment</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={obsForm.management_comment} onChange={e=>setObsForm({...obsForm,management_comment:e.target.value})}/></div>
              <div><label className="text-xs text-gray-500 block mb-1">Status</label><SearchableSelect options={[{value:"open",label:"Open"},{value:"management_accepted",label:"Management accepted"},{value:"closed",label:"Closed / Remediated"},{value:"not_accepted",label:"Not accepted"}]} value={obsForm.status} onChange={val=>setObsForm({...obsForm,status:val})}/></div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving||!selectedEng} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40">{saving?"Saving...":"Add Observation"}</button>
              {observations.length>0&&<button type="button" onClick={()=>runAI("observation_summary",observations)} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200">🤖 AI Summarise</button>}
            </div>
          </form>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b"><tr>{["Area","Observation","Risk","Recommendation","Mgmt Comment","Severity","Status"].map(h=><th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {observations.length===0&&<tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">{selectedEng?"No observations yet":"Select an audit"}</td></tr>}
                {observations.map(o=>(
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{o.area}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-xs">{o.observation?.slice(0,80)}{o.observation?.length>80?"...":""}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{o.risk_implication||"—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{o.recommendation||"—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{o.management_comment||"—"}</td>
                    <td className="px-4 py-3"><Badge s={o.severity}/></td>
                    <td className="px-4 py-3"><Badge s={o.status||"open"} map={{open:"bg-red-50 text-red-700",management_accepted:"bg-blue-50 text-blue-700",closed:"bg-green-50 text-green-700",not_accepted:"bg-orange-50 text-orange-700"}}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="report"&&(
        <div className="space-y-4">
          {!selectedEng?(
            <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
              <p className="text-lg font-medium mb-2">Select an audit to generate report</p>
            </div>
          ):(
            <>
              <div className="bg-white border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Audit Report</h3>
                    <p className="text-xs text-gray-400 mt-0.5">SA 700 / SA 705 / SA 706 · Confidential</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={generateReport} disabled={reportLoading} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">{reportLoading?"Generating...":"🔄 Generate"}</button>
                    {reportHtml&&<button onClick={printReport} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">🖨 Print / PDF</button>}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {label:"Audit Type",value:AUDIT_TYPES.find(a=>a.value===selectedEngData?.audit_type)?.label,cls:"bg-slate-50"},
                    {label:"Risk areas",value:risks.length,cls:"bg-blue-50"},
                    {label:"Controls tested",value:icfr.filter(c=>c.result!=="not_tested").length,cls:"bg-purple-50"},
                    {label:"Deficiencies",value:icfr.filter(c=>c.result==="deficient").length,cls:"bg-red-50"},
                    {label:"Checklist",value:`${checklistProgress}/${checklistItems.length}`,cls:"bg-green-50"},
                    {label:"Observations",value:observations.length,cls:"bg-amber-50"},
                    {label:"Open obs",value:observations.filter(o=>o.status==="open").length,cls:"bg-orange-50"},
                    {label:"High risk areas",value:risks.filter(r=>riskLabel(riskScore(r))==="high"||riskLabel(riskScore(r))==="critical").length,cls:"bg-rose-50"},
                  ].map(c=>(
                    <div key={c.label} className={`${c.cls} rounded-xl p-3 border`}>
                      <p className="text-xs text-gray-500">{c.label}</p>
                      <p className="text-xl font-bold text-gray-900">{c.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {reportLoading&&<div className="bg-white border rounded-xl p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-3"/><p className="text-sm text-gray-500">Generating audit report via Groq...</p></div>}
              {reportHtml&&!reportLoading&&(
                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Report preview — Print to save as PDF</span>
                    <button onClick={printReport} className="text-xs px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-700">🖨 Print / PDF</button>
                  </div>
                  <iframe srcDoc={reportHtml} className="w-full border-0" style={{height:"800px"}} title="Stat Audit Report"/>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {(aiLoading||aiResult)&&(
        <div className="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-sm">🤖 AI Audit Analysis</p>
            {aiResult&&<button onClick={()=>setAiResult(null)} className="text-gray-400 hover:text-white text-xs">✕ Close</button>}
          </div>
          {aiLoading&&<p className="animate-pulse">Analysing with Groq...</p>}
          {aiResult?.result&&(
            <div className="space-y-3">
              {Object.entries(aiResult.result).map(([key,val])=>(
                <div key={key}>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{key.replace(/_/g," ")}</p>
                  <div className="text-green-300 bg-gray-800 rounded p-2">
                    {Array.isArray(val)?<ul className="space-y-0.5 list-disc list-inside">{(val as any[]).map((item,i)=><li key={i}>{String(item)}</li>)}</ul>:<p>{String(val)}</p>}
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
