"use client"
import { useEffect, useState } from "react"

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function calcPayroll(input: any) {
  const base = Number(input.baseSalary || 0)
  const hra = Number(input.hra || 0)
  const conveyance = Number(input.conveyance || 0)
  const bonus = Number(input.bonus || 0)
  const gross = base + hra + conveyance + bonus

  const pfApplicable = input.pfApplicable !== false
  const esicApplicable = input.esicApplicable !== false && gross <= 21000
  const ptApplicable = input.ptApplicable !== false
  const tdsApplicable = input.tdsApplicable !== false

  const pf = pfApplicable ? Math.round(Math.min(base, 15000) * 0.12) : 0
  const esic = esicApplicable ? Math.round(gross * 0.0075) : 0
  const pt = ptApplicable ? (gross > 15000 ? 200 : gross > 10000 ? 150 : 0) : 0
  const annualGross = gross * 12
  let tds = 0
  if (tdsApplicable) {
    if (annualGross > 1500000) tds = Math.round((annualGross - 1500000) * 0.30 / 12)
    else if (annualGross > 1200000) tds = Math.round((annualGross - 1200000) * 0.20 / 12)
    else if (annualGross > 900000) tds = Math.round((annualGross - 900000) * 0.15 / 12)
    else if (annualGross > 600000) tds = Math.round((annualGross - 600000) * 0.10 / 12)
    else if (annualGross > 300000) tds = Math.round((annualGross - 300000) * 0.05 / 12)
  }

  const totalDeductions = pf + esic + pt + tds
  const netPay = gross - totalDeductions
  const employerPf = pfApplicable ? Math.round(Math.min(base, 15000) * 0.12) : 0
  const employerEsic = esicApplicable ? Math.round(gross * 0.0325) : 0
  const employerCost = gross + employerPf + employerEsic

  return { base, hra, conveyance, bonus, gross, pf, esic, pt, tds, totalDeductions, netPay, employerPf, employerEsic, employerCost, ctc: employerCost * 12, pfApplicable, esicApplicable, ptApplicable, tdsApplicable }
}

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkResults, setBulkResults] = useState<any[]>([])
  const [calc, setCalc] = useState<any>(null)
  const [form, setForm] = useState({
    employeeId: "", month: new Date().toISOString().slice(0, 7),
    baseSalary: "", hra: "", conveyance: "", bonus: "",
    status: "pending",
    pfApplicable: true, esicApplicable: true, ptApplicable: true, tdsApplicable: false
  })
  const orgId = "demo-org"

  useEffect(() => { load() }, [])

  async function load() {
    const [pr, er] = await Promise.all([
      fetch(`/api/hr/payroll?orgId=${orgId}`).then(r => r.json()),
      fetch(`/api/hr/employees?orgId=${orgId}`).then(r => r.json()),
    ])
    setRecords(Array.isArray(pr) ? pr : [])
    setEmployees(Array.isArray(er) ? er : [])
  }

  function setF(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }))
    if (["baseSalary","hra","conveyance","bonus","pfApplicable","esicApplicable","ptApplicable","tdsApplicable"].includes(key)) {
      const updated = { ...form, [key]: value }
      if (updated.baseSalary) setCalc(calcPayroll(updated))
    }
  }

  async function submitPayroll(e: any) {
    e.preventDefault()
    if (!calc) return
    await fetch("/api/hr/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId, employeeId: form.employeeId, month: form.month,
        baseSalary: calc.base, deductions: calc.totalDeductions,
        bonus: calc.bonus, netPay: calc.netPay, status: form.status,
      })
    })
    setShowForm(false)
    setCalc(null)
    setForm(f => ({ ...f, employeeId: "", baseSalary: "", hra: "", conveyance: "", bonus: "" }))
    load()
  }

  async function processBulkPayroll() {
    if (!form.month) return alert("Select a month first")
    setBulkProcessing(true)
    setBulkResults([])
    const results = []
    for (const emp of employees) {
      const base = emp.salary || 0
      if (!base) { results.push({ name: emp.name, status: "skipped", reason: "No salary set" }); continue }
      const c = calcPayroll({ baseSalary: base, hra: Math.round(base * 0.4), conveyance: 1600, bonus: 0, pfApplicable: true, esicApplicable: base <= 21000, ptApplicable: true, tdsApplicable: false })
      const res = await fetch("/api/hr/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, employeeId: emp.id, month: form.month, baseSalary: c.base, deductions: c.totalDeductions, bonus: 0, netPay: c.netPay, status: "pending" })
      })
      results.push({ name: emp.name, netPay: c.netPay, status: res.ok ? "processed" : "failed" })
    }
    setBulkResults(results)
    setBulkProcessing(false)
    load()
  }

  const totalPayroll = records.reduce((s, r) => s + (r.netPay || 0), 0)
  const pendingCount = records.filter(r => r.status === "pending").length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">PF · ESIC · PT · TDS — all optional per employee</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
            <label className="text-xs text-gray-500">Month</label>
            <input type="month" className="text-sm border-0 outline-none"
              value={form.month} onChange={e => setF("month", e.target.value)} />
          </div>
          <button onClick={processBulkPayroll} disabled={bulkProcessing || employees.length === 0}
            className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-40">
            {bulkProcessing ? "Processing..." : `⚡ Bulk Process (${employees.length})`}
          </button>
          <button onClick={() => setShowForm(s => !s)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
            + Single Employee
          </button>
        </div>
      </div>

      {/* Bulk results */}
      {bulkResults.length > 0 && (
        <div className="bg-white border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Bulk Processing Results</h3>
          <div className="grid grid-cols-3 gap-2">
            {bulkResults.map(r => (
              <div key={r.name} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${r.status === "processed" ? "bg-green-50" : r.status === "skipped" ? "bg-amber-50" : "bg-red-50"}`}>
                <span className="font-medium">{r.name}</span>
                <span className={`text-xs ${r.status === "processed" ? "text-green-700" : r.status === "skipped" ? "text-amber-700" : "text-red-700"}`}>
                  {r.status === "processed" ? fmt(r.netPay) : r.reason || r.status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {bulkResults.filter(r => r.status === "processed").length} processed ·
            {bulkResults.filter(r => r.status === "skipped").length} skipped ·
            {bulkResults.filter(r => r.status === "failed").length} failed
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Payroll", value: fmt(totalPayroll), color: "bg-green-50 text-green-700" },
          { label: "Pending", value: pendingCount, color: "bg-amber-50 text-amber-700" },
          { label: "Employees", value: employees.length, color: "bg-blue-50 text-blue-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Single employee form */}
      {showForm && (
        <form onSubmit={submitPayroll} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Process Payroll — Single Employee</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Employee *</label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.employeeId}
                onChange={e => {
                  const emp = employees.find(em => em.id === e.target.value)
                  setForm(f => ({ ...f, employeeId: e.target.value, baseSalary: emp?.salary?.toString() || "" }))
                  if (emp?.salary) setCalc(calcPayroll({ ...form, baseSalary: emp.salary }))
                }}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {fmt(e.salary || 0)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Basic Salary *</label>
              <input type="number" required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.baseSalary} onChange={e => setF("baseSalary", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">HRA</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.hra} onChange={e => setF("hra", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Conveyance</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.conveyance} onChange={e => setF("conveyance", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Bonus</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.bonus} onChange={e => setF("bonus", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.status} onChange={e => setF("status", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Deduction toggles */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Statutory Deductions — toggle as applicable</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: "pfApplicable", label: "PF (12%)", desc: "Provident Fund" },
                { key: "esicApplicable", label: "ESIC (0.75%)", desc: "Gross ≤ ₹21,000" },
                { key: "ptApplicable", label: "Prof. Tax", desc: "₹150–200/mo" },
                { key: "tdsApplicable", label: "TDS", desc: "Income tax" },
              ].map(d => (
                <button key={d.key} type="button"
                  onClick={() => setF(d.key, !(form as any)[d.key])}
                  className={`p-3 rounded-xl border text-left transition-colors ${(form as any)[d.key] ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                  <p className="text-xs font-semibold">{d.label}</p>
                  <p className={`text-xs mt-0.5 ${(form as any)[d.key] ? "text-gray-300" : "text-gray-400"}`}>{d.desc}</p>
                  <p className={`text-xs font-bold mt-1 ${(form as any)[d.key] ? "text-green-300" : "text-gray-300"}`}>
                    {(form as any)[d.key] ? "✓ Applied" : "Not applied"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Live calculation */}
          {calc && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium">Live Payslip Preview</p>
                <p className="text-sm font-bold text-green-300">Net Pay: {fmt(calc.netPay)}</p>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-2 text-xs uppercase">Earnings</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Basic</span><span>{fmt(calc.base)}</span></div>
                    {calc.hra > 0 && <div className="flex justify-between"><span className="text-gray-500">HRA</span><span>{fmt(calc.hra)}</span></div>}
                    {calc.conveyance > 0 && <div className="flex justify-between"><span className="text-gray-500">Conveyance</span><span>{fmt(calc.conveyance)}</span></div>}
                    {calc.bonus > 0 && <div className="flex justify-between"><span className="text-gray-500">Bonus</span><span>{fmt(calc.bonus)}</span></div>}
                    <div className="flex justify-between font-semibold border-t pt-1"><span>Gross</span><span>{fmt(calc.gross)}</span></div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2 text-xs uppercase">Deductions</p>
                  <div className="space-y-1 text-xs">
                    {calc.pfApplicable && <div className="flex justify-between"><span className="text-gray-500">PF (12%)</span><span>{fmt(calc.pf)}</span></div>}
                    {calc.esicApplicable && <div className="flex justify-between"><span className="text-gray-500">ESIC (0.75%)</span><span>{fmt(calc.esic)}</span></div>}
                    {calc.ptApplicable && calc.pt > 0 && <div className="flex justify-between"><span className="text-gray-500">Prof. Tax</span><span>{fmt(calc.pt)}</span></div>}
                    {calc.tdsApplicable && calc.tds > 0 && <div className="flex justify-between"><span className="text-gray-500">TDS</span><span>{fmt(calc.tds)}</span></div>}
                    {!calc.pfApplicable && !calc.esicApplicable && !calc.ptApplicable && !calc.tdsApplicable && <div className="text-gray-400 text-xs">No deductions applied</div>}
                    <div className="flex justify-between font-semibold border-t pt-1 text-red-600"><span>Total</span><span>{fmt(calc.totalDeductions)}</span></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Net Take Home</p>
                    <p className="text-lg font-bold text-green-700">{fmt(calc.netPay)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs">
                    <p className="text-gray-500">Employer cost: <span className="font-semibold text-gray-700">{fmt(calc.employerCost)}/mo</span></p>
                    <p className="text-gray-500">CTC: <span className="font-semibold text-gray-700">{fmt(calc.ctc)}/yr</span></p>
                    {calc.pfApplicable && <p className="text-gray-400">Employer PF: {fmt(calc.employerPf)}</p>}
                    {calc.esicApplicable && <p className="text-gray-400">Employer ESIC: {fmt(calc.employerEsic)}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={!calc}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-40">
              Save Payroll
            </button>
            <button type="button" onClick={() => { setShowForm(false); setCalc(null) }}
              className="px-5 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Records */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Payroll Records ({records.length})</h2>
          {records.filter(r => r.status === "pending").length > 0 && (
            <button onClick={async () => {
              const pending = records.filter(r => r.status === "pending")
              for (const r of pending) {
                await fetch("/api/hr/payroll", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, status: "paid" }) }).catch(() => {})
              }
              load()
            }} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
              Mark all pending as paid
            </button>
          )}
        </div>
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm">No payroll records yet. Use Bulk Process to generate for all employees.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <tr>{["Employee", "Month", "Basic", "Deductions", "Net Pay", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.employee?.name || r.employeeId}</td>
                  <td className="px-4 py-3 text-gray-500">{r.month}</td>
                  <td className="px-4 py-3">{fmt(r.baseSalary)}</td>
                  <td className="px-4 py-3 text-red-600">{fmt(r.deductions)}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{fmt(r.netPay)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      const res = await fetch("/api/hr/payroll/send-payslip", {
                        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payrollId: r.id })
                      })
                      const d = await res.json()
                      alert(d.ok ? "Payslip sent!" : `Error: ${d.error}`)
                    }} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Send</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
