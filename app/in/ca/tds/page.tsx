"use client"
import { useState, useEffect, useTransition } from "react"

type TDSFiling = {
  id: string
  clientId: string
  form_type: string
  quarter: string
  due_date: string
  filed_date: string | null
  status: string
  challan_no: string | null
  tds_amount: number | null
  late_fee: number
  notes: string | null
  assigned_to: string | null
  ca_clients?: { name: string; pan: string | null }
}

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  filed:       "bg-green-50 text-green-700 border-green-200",
  late_filed:  "bg-red-50 text-red-600 border-red-200",
  na:          "bg-gray-50 text-gray-400 border-gray-200",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", in_progress: "In progress",
  filed: "Filed", late_filed: "Late filed", na: "N/A",
}

const QUARTERS = ["Q1-2026-27", "Q2-2026-27", "Q3-2026-27", "Q4-2026-27"]
const QUARTER_DUE: Record<string, string> = {
  "Q1-2026-27": "2026-07-31",
  "Q2-2026-27": "2026-10-31",
  "Q3-2026-27": "2027-01-31",
  "Q4-2026-27": "2027-05-31",
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export default function TDSCompliancePage() {
  const [filings, setFilings]       = useState<TDSFiling[]>([])
  const [clients, setClients]       = useState<{id:string;name:string;pan:string|null}[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setStatus]   = useState("all")
  const [filterForm, setForm]       = useState("all")
  const [filterQ, setQ]             = useState("all")
  const [search, setSearch]         = useState("")
  const [showGen, setShowGen]       = useState(false)
  const [genForm, setGenForm]       = useState("26Q")
  const [genQuarter, setGenQuarter] = useState("Q1-2026-27")
  const [genClients, setGenClients] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [editId, setEditId]         = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editFiled, setEditFiled]   = useState("")
  const [editChallan, setEditChallan] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    Promise.all([
      fetch("/api/ca/tds").then(r => r.json()),
      fetch("/api/ca/clients").then(r => r.json()),
    ]).then(([t, c]) => {
      setFilings(Array.isArray(t) ? t : [])
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = filings.filter(f => {
    if (filterStatus !== "all" && f.status !== filterStatus) return false
    if (filterForm !== "all" && f.form_type !== filterForm) return false
    if (filterQ !== "all" && f.quarter !== filterQ) return false
    if (search && !f.ca_clients?.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const overdue = filings.filter(f => f.status === "pending" && daysUntil(f.due_date) < 0).length
  const dueSoon = filings.filter(f => f.status === "pending" && daysUntil(f.due_date) >= 0 && daysUntil(f.due_date) <= 14).length
  const filed   = filings.filter(f => f.status === "filed").length

  async function handleGenerate() {
    if (!genClients.length) return
    setGenerating(true)
    const rows = genClients.map(clientId => ({
      clientId,
      form_type: genForm,
      quarter: genQuarter,
      due_date: QUARTER_DUE[genQuarter],
      status: "pending",
    }))
    const res = await fetch("/api/ca/tds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    })
    const created = await res.json()
    if (Array.isArray(created)) {
      const withClients = created.map((f: TDSFiling) => ({
        ...f,
        ca_clients: clients.find(c => c.id === f.clientId),
      }))
      setFilings(prev => [...prev, ...withClients])
    }
    setShowGen(false)
    setGenClients([])
    setGenerating(false)
  }

  function startEdit(f: TDSFiling) {
    setEditId(f.id)
    setEditStatus(f.status)
    setEditFiled(f.filed_date ?? "")
    setEditChallan(f.challan_no ?? "")
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await fetch(`/api/ca/tds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          filed_date: editFiled || null,
          challan_no: editChallan || null,
        }),
      })
      setFilings(prev => prev.map(f =>
        f.id === id ? { ...f, status: editStatus, filed_date: editFiled || null, challan_no: editChallan || null } : f
      ))
      setEditId(null)
    })
  }

  if (loading) return (
    <div className="p-8 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
    </div>
  )

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">TDS compliance</h1>
          <p className="text-sm text-gray-400 mt-0.5">24Q, 26Q, 27Q quarterly filing tracker</p>
        </div>
        <button
          onClick={() => setShowGen(true)}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          + Generate filings
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",     value: filings.length, color: "text-gray-900" },
          { label: "Overdue",   value: overdue,         color: overdue > 0 ? "text-red-600" : "text-gray-900" },
          { label: "Due in 14d",value: dueSoon,         color: dueSoon > 0 ? "text-amber-600" : "text-gray-900" },
          { label: "Filed",     value: filed,           color: "text-green-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Generate filings panel */}
      {showGen && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Generate TDS filings</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Form type</label>
              <select
                value={genForm}
                onChange={e => setGenForm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              >
                {["24Q","26Q","27Q","27EQ"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Quarter</label>
              <select
                value={genQuarter}
                onChange={e => setGenQuarter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              >
                {QUARTERS.map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due date</label>
              <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-500">
                {new Date(QUARTER_DUE[genQuarter]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block">Select clients ({genClients.length} selected)</label>
            <div className="border border-gray-200 rounded-lg bg-white max-h-40 overflow-y-auto">
              <div
                className="px-3 py-2 text-xs text-blue-600 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                onClick={() => setGenClients(genClients.length === clients.length ? [] : clients.map(c => c.id))}
              >
                {genClients.length === clients.length ? "Deselect all" : "Select all clients"}
              </div>
              {clients.map(c => (
                <label key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genClients.includes(c.id)}
                    onChange={e => setGenClients(prev =>
                      e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id)
                    )}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{c.name}</span>
                  {c.pan && <span className="text-xs text-gray-400 font-mono ml-auto">{c.pan}</span>}
                </label>
              ))}
              {clients.length === 0 && (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">No clients yet — add clients first</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={!genClients.length || generating}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40"
            >
              {generating ? "Generating..." : `Generate ${genClients.length} filing${genClients.length !== 1 ? "s" : ""}`}
            </button>
            <button onClick={() => setShowGen(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:border-gray-400"
        />
        <select value={filterStatus} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterForm} onChange={e => setForm(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All forms</option>
          {["24Q","26Q","27Q","27EQ"].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterQ} onChange={e => setQ(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All quarters</option>
          {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Client","PAN","Form","Quarter","Due date","Status","Challan no","TDS amount",""].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-gray-400 py-12 text-sm">
                  {filings.length === 0
                    ? "No TDS filings yet — click \"Generate filings\" to create filings for your clients"
                    : "No filings match your filters"}
                </td>
              </tr>
            ) : filtered.map(f => {
              const days = daysUntil(f.due_date)
              const isEdit = editId === f.id
              return (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.ca_clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{f.ca_clients?.pan ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded font-medium">{f.form_type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.quarter}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">
                      {new Date(f.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                    {f.status === "pending" && (
                      <div className={`text-xs mt-0.5 ${days < 0 ? "text-red-500" : days <= 14 ? "text-amber-500" : "text-gray-400"}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
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
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLES[f.status]}`}>
                        {STATUS_LABELS[f.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <input type="text" value={editChallan} onChange={e => setEditChallan(e.target.value)}
                        placeholder="Challan no"
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-28 focus:outline-none" />
                    ) : (
                      <span className="text-gray-500 font-mono text-xs">{f.challan_no ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right">
                    {f.tds_amount != null ? `₹${f.tds_amount.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <div className="flex gap-2 items-center">
                        <input type="date" value={editFiled} onChange={e => setEditFiled(e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                        <button onClick={() => saveEdit(f.id)} disabled={isPending}
                          className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700">
                          Save
                        </button>
                        <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(f)}
                        className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                        Edit
                      </button>
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
