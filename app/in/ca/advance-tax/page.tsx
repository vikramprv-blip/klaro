"use client"
import { useState, useEffect, useTransition } from "react"

type AdvanceTax = {
  id: string
  clientId: string
  assessment_year: string
  instalment: string
  due_date: string
  due_amount: number | null
  paid_amount: number | null
  paid_date: string | null
  challan_no: string | null
  status: string
  interest_234b: number
  interest_234c: number
  ca_clients?: { name: string; pan: string | null }
}

const STATUS_STYLES: Record<string, string> = {
  pending:      "bg-amber-50 text-amber-700 border-amber-200",
  paid:         "bg-green-50 text-green-700 border-green-200",
  short_paid:   "bg-orange-50 text-orange-700 border-orange-200",
  excess_paid:  "bg-blue-50 text-blue-700 border-blue-200",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", paid: "Paid", short_paid: "Short paid", excess_paid: "Excess paid",
}

const INSTALMENTS = [
  { key: "1st", label: "1st — 15%", due: "2026-06-15" },
  { key: "2nd", label: "2nd — 45%", due: "2026-09-15" },
  { key: "3rd", label: "3rd — 75%", due: "2026-12-15" },
  { key: "4th", label: "4th — 100%", due: "2027-03-15" },
]

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default function AdvanceTaxPage() {
  const [records, setRecords]         = useState<AdvanceTax[]>([])
  const [clients, setClients]         = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterStatus, setFStatus]    = useState("all")
  const [filterInst, setFInst]        = useState("all")
  const [search, setSearch]           = useState("")
  const [showGen, setShowGen]         = useState(false)
  const [genAY, setGenAY]             = useState("AY-2026-27")
  const [genClients, setGenClients]   = useState<string[]>([])
  const [generating, setGenerating]   = useState(false)
  const [editId, setEditId]           = useState<string | null>(null)
  const [editStatus, setEditStatus]   = useState("")
  const [editPaid, setEditPaid]       = useState("")
  const [editPaidDate, setEditPaidDate] = useState("")
  const [editChallan, setEditChallan] = useState("")
  const [isPending, startTransition]  = useTransition()

  useEffect(() => {
    Promise.all([
      fetch("/api/ca/advance-tax").then(r => r.json()),
      fetch("/api/ca/clients").then(r => r.json()),
    ]).then(([a, c]) => {
      setRecords(Array.isArray(a) ? a : [])
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = records.filter(r => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false
    if (filterInst !== "all" && r.instalment !== filterInst) return false
    if (search && !r.ca_clients?.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const overdue    = records.filter(r => r.status === "pending" && daysUntil(r.due_date) < 0).length
  const paid       = records.filter(r => r.status === "paid").length
  const shortPaid  = records.filter(r => r.status === "short_paid").length
  const totalInt   = records.reduce((s, r) => s + (r.interest_234b || 0) + (r.interest_234c || 0), 0)

  async function handleGenerate() {
    if (!genClients.length) return
    setGenerating(true)
    const rows = genClients.flatMap(clientId =>
      INSTALMENTS.map(({ key, due }) => ({
        clientId, assessment_year: genAY, instalment: key, due_date: due, status: "pending",
      }))
    )
    const res = await fetch("/api/ca/advance-tax", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    })
    const created = await res.json()
    if (Array.isArray(created)) {
      setRecords(prev => [...prev, ...created.map((r: AdvanceTax) => ({
        ...r, ca_clients: clients.find(c => c.id === r.clientId),
      }))])
    }
    setShowGen(false); setGenClients([]); setGenerating(false)
  }

  function startEdit(r: AdvanceTax) {
    setEditId(r.id); setEditStatus(r.status)
    setEditPaid(r.paid_amount?.toString() ?? "")
    setEditPaidDate(r.paid_date ?? ""); setEditChallan(r.challan_no ?? "")
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      const body = {
        status: editStatus,
        paid_amount: editPaid ? parseFloat(editPaid) : null,
        paid_date: editPaidDate || null,
        challan_no: editChallan || null,
      }
      await fetch(`/api/ca/advance-tax/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      setRecords(prev => prev.map(r => r.id === id ? { ...r, ...body } : r))
      setEditId(null)
    })
  }

  if (loading) return <div className="p-8 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Advance tax</h1>
          <p className="text-sm text-gray-400 mt-0.5">4 instalment tracking — AY 2026-27</p>
        </div>
        <button onClick={() => setShowGen(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">
          + Generate instalments
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Overdue",     value: overdue,                    color: overdue > 0 ? "text-red-600" : "text-gray-900" },
          { label: "Paid",        value: paid,                       color: "text-green-700" },
          { label: "Short paid",  value: shortPaid,                  color: shortPaid > 0 ? "text-orange-600" : "text-gray-900" },
          { label: "Total interest", value: `₹${Math.round(totalInt).toLocaleString("en-IN")}`, color: totalInt > 0 ? "text-red-600" : "text-gray-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Instalment due date reference */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {INSTALMENTS.map(({ key, label, due }) => {
          const days = daysUntil(due)
          return (
            <div key={key} className="border border-gray-100 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(due).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className={`text-xs mt-1 font-medium ${days < 0 ? "text-red-500" : days <= 30 ? "text-amber-500" : "text-green-600"}`}>
                {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
              </p>
            </div>
          )
        })}
      </div>

      {showGen && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Generate advance tax instalments</h2>
          <p className="text-xs text-gray-400 mb-4">Creates all 4 instalments for selected clients</p>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Assessment year</label>
            <select value={genAY} onChange={e => setGenAY(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
              <option>AY-2026-27</option><option>AY-2025-26</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block">Select clients ({genClients.length} selected)</label>
            <div className="border border-gray-200 rounded-lg bg-white max-h-40 overflow-y-auto">
              <div onClick={() => setGenClients(genClients.length === clients.length ? [] : clients.map(c => c.id))}
                className="px-3 py-2 text-xs text-blue-600 cursor-pointer hover:bg-gray-50 border-b border-gray-100">
                {genClients.length === clients.length ? "Deselect all" : "Select all"}
              </div>
              {clients.map(c => (
                <label key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={genClients.includes(c.id)}
                    onChange={e => setGenClients(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id))}
                    className="rounded" />
                  <span className="text-sm text-gray-700">{c.name}</span>
                  {c.pan && <span className="text-xs text-gray-400 font-mono ml-auto">{c.pan}</span>}
                </label>
              ))}
              {clients.length === 0 && <p className="px-3 py-4 text-sm text-gray-400 text-center">No clients yet</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={!genClients.length || generating}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40">
              {generating ? "Generating..." : `Generate ${genClients.length * 4} instalments`}
            </button>
            <button onClick={() => setShowGen(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="text" placeholder="Search client..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:border-gray-400" />
        <select value={filterStatus} onChange={e => setFStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterInst} onChange={e => setFInst(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All instalments</option>
          {INSTALMENTS.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} records</span>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Client","Instalment","Due date","Status","Due amount","Paid amount","Challan","Interest",""].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-400 py-12 text-sm">
                {records.length === 0 ? "No advance tax records — click \"Generate instalments\" to start" : "No records match filters"}
              </td></tr>
            ) : filtered.map(r => {
              const days = daysUntil(r.due_date)
              const isEdit = editId === r.id
              return (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.ca_clients?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">{r.instalment}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    {r.status === "pending" && (
                      <div className={`text-xs mt-0.5 ${days < 0 ? "text-red-500" : days <= 30 ? "text-amber-500" : "text-gray-400"}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none">
                        {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.due_amount != null ? `₹${r.due_amount.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <input type="number" value={editPaid} onChange={e => setEditPaid(e.target.value)} placeholder="Amount"
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-24 focus:outline-none" />
                    ) : (
                      <span className="text-gray-600">{r.paid_amount != null ? `₹${r.paid_amount.toLocaleString("en-IN")}` : "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <input type="text" value={editChallan} onChange={e => setEditChallan(e.target.value)} placeholder="Challan"
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-24 focus:outline-none" />
                    ) : (
                      <span className="text-xs text-gray-500 font-mono">{r.challan_no ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {(r.interest_234b || r.interest_234c) ? `₹${((r.interest_234b||0)+(r.interest_234c||0)).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <div className="flex gap-2 items-center">
                        <input type="date" value={editPaidDate} onChange={e => setEditPaidDate(e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                        <button onClick={() => saveEdit(r.id)} disabled={isPending}
                          className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700">Save</button>
                        <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(r)} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">Edit</button>
                    )}
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
