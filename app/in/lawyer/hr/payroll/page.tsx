"use client"
import { useEffect, useState } from "react"

export default function LawyerPayrollPage() {
  const [payroll, setPayroll] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [form, setForm] = useState({ employee_id: "", month: new Date().toISOString().slice(0,7), basic: "", allowances: "", deductions: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const [pr, er] = await Promise.all([
      fetch("/api/hr/payroll?orgId=demo-org").then(r => r.json()),
      fetch("/api/hr/employees?orgId=demo-org").then(r => r.json())
    ])
    setPayroll(Array.isArray(pr) ? pr : [])
    setEmployees(Array.isArray(er) ? er : [])
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(e: any) {
    e.preventDefault()
    setSaving(true)
    const net = (Number(form.basic) + Number(form.allowances)) - Number(form.deductions)
    await fetch("/api/hr/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, net_salary: net, orgId: "demo-org" })
    })
    setSaving(false)
    load()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Payroll</h1>
      <form onSubmit={handleGenerate} className="bg-white border rounded-xl p-5 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Employee</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required>
            <option value="">Select employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Month</label>
          <input type="month" className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
        </div>
        {[["basic","Basic Salary"],["allowances","Allowances"],["deductions","Deductions"]].map(([k,l]) => (
          <div key={k}>
            <label className="text-xs text-gray-500">{l} (₹)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              value={(form as any)[k]} onChange={e => setForm({...form, [k]: e.target.value})} />
          </div>
        ))}
        <div className="flex items-end">
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm w-full">
            Net: <span className="font-bold text-gray-900">₹{((Number(form.basic)+Number(form.allowances))-Number(form.deductions))||0}</span>
          </div>
        </div>
        <div className="col-span-2">
          <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
            {saving ? "Generating..." : "Generate Payslip"}
          </button>
        </div>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{["Employee","Month","Basic","Allowances","Deductions","Net"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {payroll.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No payroll records</td></tr>}
            {payroll.map((p,i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 font-medium">{p.employee_name || p.employee_id}</td>
                <td className="px-4 py-3 text-gray-500">{p.month}</td>
                <td className="px-4 py-3">₹{p.basic}</td>
                <td className="px-4 py-3">₹{p.allowances}</td>
                <td className="px-4 py-3 text-red-600">-₹{p.deductions}</td>
                <td className="px-4 py-3 font-semibold text-green-700">₹{p.net_salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
