"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"

export default function TimeBillingPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [stats, setStats] = useState({ totalHours: 0, totalAmount: 0, unbilledAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState("")
  const [form, setForm] = useState({
    matter_id: "", date: new Date().toISOString().split("T")[0],
    hours: "", rate_per_hour: "", description: "", billable: true
  })

  async function load() {
    const [tr, mr] = await Promise.all([
      fetch("/api/lawyer/time-billing").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ])
    setEntries(tr.entries || [])
    setStats({ totalHours: tr.totalHours, totalAmount: tr.totalAmount, unbilledAmount: tr.unbilledAmount })
    setMatters(Array.isArray(mr) ? mr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleLog(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/lawyer/time-billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ matter_id: "", date: new Date().toISOString().split("T")[0], hours: "", rate_per_hour: "", description: "", billable: true })
    load()
  }

  async function markBilled(id: string, billed: boolean) {
    await fetch("/api/lawyer/time-billing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, billed })
    })
    load()
  }

  const filtered = filter ? entries.filter(e => e.matter_id === filter) : entries

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time Billing</h1>
        <p className="text-sm text-gray-500 mt-1">ABA-style billable hours tracking per matter</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Hours", value: `${Number(stats.totalHours).toFixed(1)}h`, color: "bg-blue-50 text-blue-700" },
          { label: "Total Billed", value: `₹${Number(stats.totalAmount).toLocaleString("en-IN")}`, color: "bg-green-50 text-green-700" },
          { label: "Unbilled Amount", value: `₹${Number(stats.unbilledAmount).toLocaleString("en-IN")}`, color: "bg-amber-50 text-amber-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Log time */}
      <form onSubmit={handleLog} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Log Time</h2>
        <div className="grid grid-cols-3 gap-4">
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
            <label className="text-xs text-gray-500 block mb-1">Date *</label>
            <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Hours *</label>
            <input type="number" step="0.25" required className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="1.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rate/Hour (₹)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="5000" value={form.rate_per_hour} onChange={e => setForm({ ...form, rate_per_hour: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Billable</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.billable ? "true" : "false"} onChange={e => setForm({ ...form, billable: e.target.value === "true" })}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Description *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Drafting petition, court appearance..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <button disabled={saving} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Logging..." : "Log Time"}
        </button>
      </form>

      {/* Filter + Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Time Entries ({filtered.length})</h2>
          <select className="text-sm border rounded-lg px-3 py-1.5"
            value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All matters</option>
            {matters.map(m => <option key={m.id} value={m.id}>{m.client_name} — {m.matter_title || m.title}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Date", "Matter", "Description", "Hours", "Rate", "Amount", "Billable", "Status", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No time entries yet</td></tr>}
            {filtered.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{e.date}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-xs">{e.legal_matters?.client_name || "—"}</p>
                  <p className="text-xs text-gray-500">{e.legal_matters?.matter_title || ""}</p>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-48 truncate">{e.description}</td>
                <td className="px-4 py-3 font-medium">{e.hours}h</td>
                <td className="px-4 py-3 text-gray-500">₹{Number(e.rate_per_hour).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 font-semibold text-green-700">₹{Number(e.amount).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{e.billable ? <span className="text-green-600 text-xs">✓ Billable</span> : <span className="text-gray-400 text-xs">Non-billable</span>}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${e.billed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {e.billed ? "Billed" : "Unbilled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!e.billed && <button onClick={() => markBilled(e.id, true)} className="text-xs text-blue-500 hover:underline">Mark billed</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
