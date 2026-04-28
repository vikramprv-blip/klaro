"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"

function daysLeft(expiry: string) {
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
}

function urgencyColor(days: number) {
  if (days < 0) return "bg-red-100 text-red-800 border-red-200";
  if (days <= 30) return "bg-red-50 text-red-700 border-red-200";
  if (days <= 90) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-green-50 text-green-700 border-green-200";
}

export default function LimitationPage() {
  const [records, setRecords] = useState<any[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [presets, setPresets] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ matter_id: "", cause_of_action: "", incident_date: "", limitation_days: 365, notes: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const [lr, mr] = await Promise.all([
      fetch("/api/lawyer/limitation").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ])
    setRecords(lr.records || [])
    setPresets(lr.presets || {})
    setMatters(Array.isArray(mr) ? mr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/lawyer/limitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ matter_id: "", cause_of_action: "", incident_date: "", limitation_days: 365, notes: "" })
    load()
  }

  async function handleDelete(id: string) {
    await fetch("/api/lawyer/limitation", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    load()
  }

  const expired = records.filter(r => daysLeft(r.expiry_date) < 0).length
  const critical = records.filter(r => { const d = daysLeft(r.expiry_date); return d >= 0 && d <= 30 }).length

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Limitation Period Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Track limitation periods — never let a matter go time-barred</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total tracked", value: records.length, color: "bg-blue-50 text-blue-700" },
          { label: "Expired", value: expired, color: "bg-red-50 text-red-700" },
          { label: "Critical (≤30 days)", value: critical, color: "bg-amber-50 text-amber-700" },
          { label: "Safe (>90 days)", value: records.filter(r => daysLeft(r.expiry_date) > 90).length, color: "bg-green-50 text-green-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Limitation Period</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Matter</label>
            {/* matter_id select replaced by SearchableSelect */}
              <SearchableSelect
                options={[{value:"",label:"No matter"}, ...(matters||[]).map((m:any)=>({value:m.id,label:`${m.client_name} — ${m.matter_title||m.title||"Matter"}`,sub:m.cnr_number||m.court||""}))]}
                value={form.matter_id||""}
                onChange={val=>setForm({...form,matter_id:val})}
                placeholder="Search matter or client..."
              />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Cause of Action *</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" required
              value={form.cause_of_action}
              onChange={e => {
                const preset = presets[e.target.value]
                setForm({ ...form, cause_of_action: e.target.value, limitation_days: preset?.days || 365 })
              }}>
              <option value="">Select cause</option>
              {Object.keys(presets).map(k => <option key={k} value={k}>{k} ({presets[k].days} days)</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Incident / Cause Date *</label>
            <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Limitation Period (days)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.limitation_days} onChange={e => setForm({ ...form, limitation_days: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Records */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              {["Matter / Client", "Cause of Action", "Incident Date", "Expiry Date", "Days Left", "Act / Reference", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No limitation periods tracked yet</td></tr>}
            {records.map(r => {
              const days = daysLeft(r.expiry_date)
              return (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.legal_matters?.client_name || "—"}</p>
                    <p className="text-xs text-gray-500">{r.legal_matters?.matter_title || "No matter"}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.cause_of_action}</td>
                  <td className="px-4 py-3 text-gray-500">{r.incident_date}</td>
                  <td className="px-4 py-3 text-gray-500">{r.expiry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColor(days)}`}>
                      {days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : `${days} days`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{presets[r.cause_of_action]?.act || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
