"use client"
import { useEffect, useState } from "react"

function daysLeft(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function ChallanPage() {
  const [challans, setChallans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [form, setForm] = useState({ client_name: "", pan: "", assessment_year: "2026-27", estimated_tax: "" })
  const [payForm, setPayForm] = useState({ paid_amount: "", challan_number: "", bsr_code: "", paid_date: new Date().toISOString().split("T")[0] })

  async function load() {
    const r = await fetch("/api/ca/challan").then(r => r.json())
    setChallans(r.challans || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(e: any) {
    e.preventDefault()
    setGenerating(true)
    await fetch("/api/ca/challan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setGenerating(false)
    setForm({ client_name: "", pan: "", assessment_year: "2026-27", estimated_tax: "" })
    load()
  }

  async function handleMarkPaid(id: string) {
    await fetch("/api/ca/challan", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid", ...payForm })
    })
    setPayingId(null)
    load()
  }

  const grouped: Record<string, any[]> = {}
  challans.forEach(c => {
    const key = `${c.client_name} (${c.assessment_year})`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  })

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advance Tax Challan Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Auto-generate Challan 280 instalments for all clients</p>
      </div>

      {/* Generate */}
      <form onSubmit={handleGenerate} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Generate Challans</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">PAN *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase"
              placeholder="AAAPL1234C"
              value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Assessment Year</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.assessment_year} onChange={e => setForm({ ...form, assessment_year: e.target.value })}>
              {["2026-27", "2025-26", "2024-25"].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Estimated Tax (₹) *</label>
            <input required type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="100000"
              value={form.estimated_tax} onChange={e => setForm({ ...form, estimated_tax: e.target.value })} />
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          💡 All 4 instalments will be auto-generated: 15% by 15 Jun · 30% by 15 Sep · 30% by 15 Dec · 25% by 15 Mar
        </div>
        <button disabled={generating} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {generating ? "Generating..." : "Generate All 4 Challans"}
        </button>
      </form>

      {/* Grouped challans */}
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-sm font-semibold text-gray-900">{group}</p>
            <p className="text-xs text-gray-500">PAN: {items[0].pan}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>{["Instalment", "Due Date", "Amount", "Challan No.", "BSR Code", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {items.sort((a, b) => a.instalment - b.instalment).map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.instalment}{["st","nd","rd","th"][c.instalment - 1]} Instalment</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.due_date}
                    {c.status === "pending" && daysLeft(c.due_date) <= 7 && daysLeft(c.due_date) >= 0 && (
                      <span className="ml-2 text-xs text-amber-600 font-medium">⚠ {daysLeft(c.due_date)}d left</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{Number(c.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.challan_number || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.bsr_code || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "paid" ? "bg-green-50 text-green-700" : daysLeft(c.due_date) < 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {c.status === "paid" ? "Paid" : daysLeft(c.due_date) < 0 ? "Overdue" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "pending" && payingId !== c.id && (
                      <button onClick={() => setPayingId(c.id)} className="text-xs text-blue-600 hover:underline">Mark Paid</button>
                    )}
                    {payingId === c.id && (
                      <div className="flex gap-1 items-center">
                        <input className="border rounded px-2 py-1 text-xs w-24" placeholder="Challan no."
                          value={payForm.challan_number} onChange={e => setPayForm({ ...payForm, challan_number: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-xs w-20" placeholder="BSR"
                          value={payForm.bsr_code} onChange={e => setPayForm({ ...payForm, bsr_code: e.target.value })} />
                        <button onClick={() => handleMarkPaid(c.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">✓</button>
                        <button onClick={() => setPayingId(null)} className="px-2 py-1 border rounded text-xs">✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {Object.keys(grouped).length === 0 && (
        <div className="bg-white border rounded-xl px-4 py-10 text-center text-gray-400">
          No challans generated yet — add a client above to generate their advance tax schedule
        </div>
      )}
    </div>
  )
}
