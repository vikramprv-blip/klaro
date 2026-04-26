"use client"
import { useEffect, useState } from "react"

type PayrollCalc = {
  baseSalary: number
  hra: number
  conveyance: number
  bonus: number
  grossSalary: number
  totalGross: number
  deductions: {
    pf: number
    esic: number
    professionalTax: number
    incomeTaxTds: number
    total: number
  }
  employerContributions: {
    pf: number
    esic: number
    total: number
  }
  netPay: number
  employerCost: number
  ctc: number
  esicApplicable: boolean
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [calc, setCalc] = useState<PayrollCalc | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [form, setForm] = useState({
    employeeId: "", month: "", baseSalary: "",
    hra: "", conveyance: "", bonus: "", status: "pending"
  })
  const orgId = "demo-org"

  useEffect(() => { load() }, [])

  async function load() {
    const [payrollRes, empRes] = await Promise.all([
      fetch(`/api/hr/payroll?orgId=${orgId}`),
      fetch(`/api/hr/employees?orgId=${orgId}`),
    ])
    const payroll = await payrollRes.json()
    const emps = await empRes.json()
    setRecords(Array.isArray(payroll) ? payroll : [])
    setEmployees(Array.isArray(emps) ? emps : [])
  }

  async function calculate() {
    setCalcLoading(true)
    const res = await fetch("/api/hr/payroll/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseSalary: Number(form.baseSalary || 0),
        hra: Number(form.hra || 0),
        conveyance: Number(form.conveyance || 0),
        bonus: Number(form.bonus || 0),
      }),
    })
    const data = await res.json()
    setCalc(data)
    setShowCalc(true)
    setCalcLoading(false)
  }

  async function submitPayroll(e: React.FormEvent) {
    e.preventDefault()
    const deductions = calc?.deductions.total || 0
    const netPay = calc?.netPay || Number(form.baseSalary)
    await fetch("/api/hr/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        employeeId: form.employeeId,
        month: form.month,
        baseSalary: Number(form.baseSalary),
        deductions,
        bonus: Number(form.bonus || 0),
        netPay,
        status: form.status,
      }),
    })
    setShowForm(false)
    setShowCalc(false)
    setCalc(null)
    setForm({ employeeId: "", month: "", baseSalary: "", hra: "", conveyance: "", bonus: "", status: "pending" })
    load()
  }

  const totalPayroll = records.reduce((s, r) => s + (r.netPay || 0), 0)
  const pendingCount = records.filter(r => r.status === "pending").length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">PF · ESIC · PT · TDS — all statutory deductions calculated</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">
          + Process Payroll
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Payroll</p>
          <p className="text-2xl font-semibold mt-1">{fmt(totalPayroll)}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-semibold mt-1">{pendingCount}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Records</p>
          <p className="text-2xl font-semibold mt-1">{records.length}</p>
        </div>
      </div>

      {/* Payroll Form */}
      {showForm && (
        <form onSubmit={submitPayroll}
          className="border rounded-2xl p-5 mb-6 bg-gray-50 space-y-4">
          <h2 className="font-medium">Process Payroll</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Employee *</label>
              <select className="w-full border rounded-xl px-3 py-2 text-sm" required
                value={form.employeeId}
                onChange={e => {
                  const emp = employees.find(em => em.id === e.target.value)
                  setForm(f => ({ ...f, employeeId: e.target.value, baseSalary: emp?.salary?.toString() || "" }))
                }}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Month *</label>
              <input type="month" className="w-full border rounded-xl px-3 py-2 text-sm" required
                value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Basic Salary *</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm" required
                placeholder="e.g. 50000" value={form.baseSalary}
                onChange={e => setForm(f => ({ ...f, baseSalary: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">HRA</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. 20000" value={form.hra}
                onChange={e => setForm(f => ({ ...f, hra: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Conveyance</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. 1600" value={form.conveyance}
                onChange={e => setForm(f => ({ ...f, conveyance: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Bonus</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. 5000" value={form.bonus}
                onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))} />
            </div>
          </div>

          <button type="button" onClick={calculate} disabled={!form.baseSalary || calcLoading}
            className="px-4 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm hover:bg-blue-50 disabled:opacity-40">
            {calcLoading ? "Calculating..." : "Calculate Deductions"}
          </button>

          {/* Calculation Result */}
          {showCalc && calc && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-white px-4 py-3">
                <p className="text-sm font-medium">Payslip Preview</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-2">Earnings</p>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">Basic Salary</span><span>{fmt(calc.baseSalary)}</span></div>
                    {calc.hra > 0 && <div className="flex justify-between"><span className="text-gray-500">HRA</span><span>{fmt(calc.hra)}</span></div>}
                    {calc.conveyance > 0 && <div className="flex justify-between"><span className="text-gray-500">Conveyance</span><span>{fmt(calc.conveyance)}</span></div>}
                    {calc.bonus > 0 && <div className="flex justify-between"><span className="text-gray-500">Bonus</span><span>{fmt(calc.bonus)}</span></div>}
                    <div className="flex justify-between font-medium border-t pt-1"><span>Gross</span><span>{fmt(calc.totalGross)}</span></div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Deductions</p>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">PF (12%)</span><span>{fmt(calc.deductions.pf)}</span></div>
                    {calc.esicApplicable && <div className="flex justify-between"><span className="text-gray-500">ESIC (0.75%)</span><span>{fmt(calc.deductions.esic)}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Prof. Tax</span><span>{fmt(calc.deductions.professionalTax)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">TDS</span><span>{fmt(calc.deductions.incomeTaxTds)}</span></div>
                    <div className="flex justify-between font-medium border-t pt-1 text-red-600"><span>Total Deductions</span><span>{fmt(calc.deductions.total)}</span></div>
                  </div>
                </div>
                <div className="col-span-2 bg-green-50 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Net Take Home</p>
                    <p className="text-xl font-bold text-green-700">{fmt(calc.netPay)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Employer Cost</p>
                    <p className="text-sm font-medium">{fmt(calc.employerCost)}/mo</p>
                    <p className="text-xs text-gray-400">CTC: {fmt(calc.ctc)}/yr</p>
                  </div>
                </div>
                <div className="col-span-2 text-xs text-gray-400 border-t pt-2">
                  Employer PF: {fmt(calc.employerContributions.pf)} ·
                  {calc.esicApplicable ? ` Employer ESIC: ${fmt(calc.employerContributions.esic)} ·` : ""}
                  Total employer contribution: {fmt(calc.employerContributions.total)}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit"
              className="px-4 py-2 bg-black text-white rounded-xl text-sm">
              Save Payroll
            </button>
            <button type="button" onClick={() => { setShowForm(false); setShowCalc(false); setCalc(null) }}
              className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Records */}
      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-sm">No payroll records yet.</p>
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Employee", "Month", "Basic", "Deductions", "Net Pay", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.employee?.name || r.employeeId}</td>
                  <td className="px-4 py-3 text-gray-500">{r.month}</td>
                  <td className="px-4 py-3">{fmt(r.baseSalary)}</td>
                  <td className="px-4 py-3 text-red-500">{fmt(r.deductions)}</td>
                  <td className="px-4 py-3 font-medium text-green-700">{fmt(r.netPay)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/hr/payroll/send-payslip", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ payrollId: r.id }),
                        })
                        const data = await res.json()
                        alert(data.ok ? "Payslip sent via WhatsApp!" : `Error: ${data.error}`)
                      }}
                      className="text-xs px-2 py-1 border rounded-lg hover:bg-gray-50 text-gray-600">
                      Send Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
