"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"

const STATES = ["Delhi","Maharashtra","Karnataka","Tamil Nadu","Uttar Pradesh","Gujarat","Rajasthan","West Bengal","Andhra Pradesh","Telangana","Kerala","Madhya Pradesh","Punjab","Haryana","Bihar","Odisha","Assam","Jharkhand","Uttarakhand","Himachal Pradesh","Chhattisgarh","Goa","Other"]
const COURT_TYPES = ["District Civil Court","District Criminal Court","High Court","Supreme Court","NCLT","NCLAT","Consumer Forum (District)","Consumer Forum (State)","Consumer Forum (National)","RERA","Labour Court","Family Court"]
const SUIT_TYPES = ["Money Recovery","Injunction","Declaration","Specific Performance","Probate","Divorce","Property Dispute","Appeal","Revision","Writ","SLP","Other"]

export default function CourtFeePage() {
  const [calculations, setCalculations] = useState<any[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [form, setForm] = useState({
    matter_id: "", court_type: "District Civil Court", state: "Delhi",
    suit_type: "Money Recovery", claim_amount: "", advocate_fee: "", notes: ""
  })

  async function load() {
    const [cr, mr] = await Promise.all([
      fetch("/api/lawyer/court-fee").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ])
    setCalculations(cr.calculations || [])
    setMatters(Array.isArray(mr) ? mr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCalculate(e: any) {
    e.preventDefault()
    setCalculating(true)
    const res = await fetch("/api/lawyer/court-fee", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    const data = await res.json()
    setCalculating(false)
    setResult(data)
    load()
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Court Fee Calculator</h1>
        <p className="text-sm text-gray-500 mt-1">State-wise court fee calculation for all major Indian courts and tribunals</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Calculator */}
        <form onSubmit={handleCalculate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Calculate Fee</h2>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Matter (optional)</label>
            {/* matter_id select replaced by SearchableSelect */}
              <SearchableSelect
                options={[{value:"",label:"No matter"}, ...(matters||[]).map((m:any)=>({value:m.id,label:`${m.client_name} — ${m.matter_title||m.title||"Matter"}`,sub:m.cnr_number||m.court||""}))]}
                value={form.matter_id||""}
                onChange={val=>setForm({...form,matter_id:val})}
                placeholder="Search matter or client..."
              />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">State *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Court Type *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.court_type} onChange={e => setForm({ ...form, court_type: e.target.value })}>
              {COURT_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Suit / Case Type *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.suit_type} onChange={e => setForm({ ...form, suit_type: e.target.value })}>
              {SUIT_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Claim / Dispute Amount (₹)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 500000"
              value={form.claim_amount} onChange={e => setForm({ ...form, claim_amount: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Advocate Fee (₹) — optional</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 25000"
              value={form.advocate_fee} onChange={e => setForm({ ...form, advocate_fee: e.target.value })} />
          </div>
          <button disabled={calculating} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
            {calculating ? "Calculating..." : "Calculate Court Fee"}
          </button>
        </form>

        {/* Result */}
        <div className="space-y-4">
          {result && (
            <div className="bg-white border-2 border-gray-900 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Fee Breakdown</h2>

              <div className="space-y-3">
                {[
                  { label: "Court Fee", amount: result.court_fee, color: "text-gray-900" },
                  { label: "Process Fee", amount: result.process_fee, color: "text-gray-700" },
                  { label: "Advocate Fee", amount: result.advocate_fee || 0, color: "text-gray-700" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-gray-600">{r.label}</span>
                    <span className={`font-semibold ${r.color}`}>₹{Number(r.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total Payable</span>
                  <span className="font-bold text-xl text-gray-900">₹{Number(result.total_fee).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Reference</p>
                <p>{result.calc_notes || result.notes}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                ⚠️ Court fees vary by court and case specifics. Always verify with the court registry before filing.
              </div>

              <button onClick={() => { navigator.clipboard.writeText(`Court Fee: ₹${result.court_fee}\nProcess Fee: ₹${result.process_fee}\nAdvocate Fee: ₹${result.advocate_fee || 0}\nTotal: ₹${result.total_fee}`) }}
                className="w-full py-2 border rounded-lg text-sm hover:bg-gray-50">
                Copy to clipboard
              </button>
            </div>
          )}

          {/* Recent calculations */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Recent Calculations ({calculations.length})</h2>
            </div>
            {calculations.length === 0 && <p className="px-4 py-6 text-center text-gray-400 text-sm">No calculations yet</p>}
            {calculations.slice(0, 8).map(c => (
              <div key={c.id} className="px-4 py-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setResult(c)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.state} — {c.court_type}</p>
                    <p className="text-xs text-gray-500">{c.suit_type} · ₹{Number(c.claim_amount || 0).toLocaleString("en-IN")} claim</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">₹{Number(c.total_fee).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
