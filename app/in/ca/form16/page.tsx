"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"

export default function Form16Page() {
  const [records, setRecords] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_name: "", employee_name: "", pan: "",
    form_type: "16", financial_year: "2024-25",
    gross_salary: "", tds_deducted: "", certificate_no: ""
  })

  async function load() {
    const r = await fetch("/api/ca/form16").then(r => r.json())
    setRecords(r.records || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(e: any) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/ca/form16", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ client_name: "", employee_name: "", pan: "", form_type: "16", financial_year: "2024-25", gross_salary: "", tds_deducted: "", certificate_no: "" })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/ca/form16", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    load()
  }

  const grouped: Record<string, any[]> = {}
  records.forEach(r => {
    const key = r.financial_year
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  })

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Form 16 / 16A Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Generate TDS certificates for employees and deductees</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">Form 16</p>
          <p className="text-xs">For salaried employees — employer deducting TDS under Section 192. Due: 15 June each year.</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700">
          <p className="font-semibold mb-1">Form 16A</p>
          <p className="text-xs">For non-salary TDS — interest, rent, professional fees. Due: 15 days after quarterly due date.</p>
        </div>
      </div>

      {/* Generate form */}
      <form onSubmit={handleGenerate} className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Generate Certificate</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Form Type</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.form_type} onChange={e => setForm({ ...form, form_type: e.target.value })}>
              <option value="16">Form 16 (Salary)</option>
              <option value="16A">Form 16A (Non-salary)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Financial Year</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.financial_year} onChange={e => setForm({ ...form, financial_year: e.target.value })}>
              {["2024-25", "2023-24", "2022-23", "2021-22"].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client / Employer Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Employee / Deductee Name *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.employee_name} onChange={e => setForm({ ...form, employee_name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">PAN *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase"
              placeholder="AAAPL1234C"
              value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Certificate No.</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.certificate_no} onChange={e => setForm({ ...form, certificate_no: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Gross Salary / Amount (₹)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.gross_salary} onChange={e => setForm({ ...form, gross_salary: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">TDS Deducted (₹) *</label>
            <input type="number" required className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.tds_deducted} onChange={e => setForm({ ...form, tds_deducted: e.target.value })} />
          </div>
        </div>
        <button disabled={saving} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          {saving ? "Generating..." : "Generate Certificate"}
        </button>
      </form>

      {/* Records grouped by FY */}
      {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([fy, items]) => (
        <div key={fy} className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">FY {fy}</h2>
            <span className="text-xs text-gray-500">{items.length} certificates</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>{["Form", "Client", "Employee / Deductee", "PAN", "Gross Amount", "TDS Deducted", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">Form {r.form_type}</span></td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.client_name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.employee_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.pan}</td>
                  <td className="px-4 py-3">₹{r.gross_salary ? Number(r.gross_salary).toLocaleString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 font-semibold text-red-700">₹{Number(r.tds_deducted).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "issued" ? "bg-green-50 text-green-700" : r.status === "generated" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "generated" && (
                      <button onClick={() => updateStatus(r.id, "issued")}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">
                        Mark Issued
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {Object.keys(grouped).length === 0 && (
        <div className="bg-white border rounded-xl px-5 py-10 text-center text-gray-400 text-sm">
          No Form 16 records yet — generate one above
        </div>
      )}
    </div>
  )
}
