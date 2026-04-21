"use client"
import { useState, useEffect, useTransition } from "react"

type ITRFiling = {
  id: string
  client_id: string
  itr_form: string
  assessment_year: string
  due_date: string
  filed_date: string | null
  ack_number: string | null
  status: string
  gross_income: number | null
  tax_payable: number | null
  refund_due: number | null
  regime: string | null
  notes: string | null
  assigned_to: string | null
  ca_clients?: { name: string; pan: string | null; entity_type: string }
}

const STATUS_STYLES: Record<string, string> = {
  pending:         "bg-amber-50 text-amber-700 border-amber-200",
  docs_pending:    "bg-orange-50 text-orange-700 border-orange-200",
  in_progress:     "bg-blue-50 text-blue-700 border-blue-200",
  review_pending:  "bg-purple-50 text-purple-700 border-purple-200",
  filed:           "bg-green-50 text-green-700 border-green-200",
  late_filed:      "bg-red-50 text-red-600 border-red-200",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", docs_pending: "Docs pending", in_progress: "In progress",
  review_pending: "Review pending", filed: "Filed", late_filed: "Late filed",
}

const ITR_FORMS = ["ITR-1","ITR-2","ITR-3","ITR-4","ITR-5","ITR-6","ITR-7"]
const AY = ["AY-2026-27","AY-2025-26"]

const FORM_DUE: Record<string, string> = {
  "ITR-1": "2026-07-31", "ITR-2": "2026-07-31", "ITR-4": "2026-07-31",
  "ITR-3": "2026-10-31", "ITR-5": "2026-10-31", "ITR-6": "2026-10-31", "ITR-7": "2026-10-31",
}

const ENTITY_FORM: Record<string, string> = {
  individual: "ITR-1", proprietorship: "ITR-3", partnership: "ITR-5",
  llp: "ITR-5", private_limited: "ITR-6", public_limited: "ITR-6",
  trust: "ITR-7", huf: "ITR-2",
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default function ITRTrackerPage() {
  const [filings, setFilings]         = useState<ITRFiling[]>([])
  const [clients, setClients]         = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterStatus, setFStatus]    = useState("all")
  const [filterForm, setFForm]        = useState("all")
  const [search, setSearch]           = useState("")
  const [showGen, setShowGen]         = useState(false)
  const [genAY, setGenAY]             = useState("AY-2026-27")
  const [genClients, setGenClients]   = useState<string[]>([])
  const [generating, setGenerating]   = useState(false)
  const [editId, setEditId]           = useState<string | null>(null)
  const [editStatus, setEditStatus]   = useState("")
  const [editFiled, setEditFiled]     = useState("")
  const [editAck, setEditAck]         = useState("")
  const [editRegime, setEditRegime]   = useState("")
  const [isPending, startTransition]  = useTransition()

  useEffect(() => {
    Promise.all([
      fetch("/api/ca/itr").then(r => r.json()),
      fetch("/api/ca/clients").then(r => r.json()),
    ]).then(([i, c]) => {
      setFilings(Array.isArray(i) ? i : [])
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = filings.filter(f => {
    if (filterStatus !== "all" && f.status !== filterStatus) return false
    if (filterForm !== "all" && f.itr_form !== filterForm) return false
    if (search && !f.ca_clients?.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const overdue       = filings.filter(f => f.status === "pending" && daysUntil(f.due_date) < 0).length
  const docsPending   = filings.filter(f => f.status === "docs_pending").length
  const reviewPending = filings.filter(f => f.status === "review_pending").length
  const filed         = filings.filter(f => f.status === "filed").length

  async function handleGenerate() {
    if (!genClients.length) return
    setGenerating(true)
    const rows = genClients.map(client_id => {
      const client = clients.find(c => c.id === client_id)
      const itr_form = ENTITY_FORM[client?.entity_type] ?? "ITR-1"
      return {
        client_id,
        itr_form,
        assessment_year: genAY,
        due_date: FORM_DUE[itr_form],
        status: "pending",
      }
    })
    const res = await fetch("/api/ca/itr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    })
    const created = await res.json()
    if (Array.isArray(created)) {
      setFilings(prev => [...prev, ...created.map((f: ITRFiling) => ({
        ...f, ca_clients: clients.find(c => c.id === f.client_id),
      }))])
    }
    setShowGen(false)
    setGenClients([])
    setGenerating(false)
  }

  function startEdit(f: ITRFiling) {
    setEditId(f.id); setEditStatus(f.status)
    setEditFiled(f.filed_date ?? ""); setEditAck(f.ack_number ?? "")
    setEditRegime(f.regime ?? "")
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await fetch(`/api/ca/itr/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, filed_date: editFiled || null, ack_number: editAck || null, regime: editRegime || null }),
      })
      setFilings(prev => prev.map(f => f.id === id
        ? { ...f, status: editStatus, filed_date: editFiled || null, ack_number: editAck || null, regime: editRegime || null }
        : f))
      setEditId(null)
    })
  }

  if (loading) return <div className="p-8 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">ITR tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Income tax return filing — AY 2026-27</p>
        </div>
        <button onClick={() => setShowGen(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">
          + Generate filings
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",          value: filings.length, color: "text-gray-900" },
          { label: "Overdue",        value: overdue,         color: overdue > 0 ? "text-red-600" : "text-gray-900" },
          { label: "Docs pending",   value: docsPending,     color: docsPending > 0 ? "text-orange-600" : "text-gray-900" },
          { label: "Review pending", value: reviewPending,   color: reviewPending > 0 ? "text-purple-600" : "text-gray-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {showGen && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Generate ITR filings</h2>
          <p className="text-xs text-gray-500 mb-3">ITR form is auto-selected based on client entity type</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Assessment year</label>
              <select value={genAY} onChange={e => setGenAY(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                {AY.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
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
                  <span className="text-xs text-gray-400 ml-auto">{ENTITY_FORM[c.entity_type] ?? "ITR-1"}</span>
                </label>
              ))}
              {clients.length === 0 && <p className="px-3 py-4 text-sm text-gray-400 text-center">No clients yet</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={!genClients.length || generating}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40">
              {generating ? "Generating..." : `Generate ${genClients.length} filing${genClients.length !== 1 ? "s" : ""}`}
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
        <select value={filterForm} onChange={e => setFForm(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All forms</option>
          {ITR_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} records</span>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Client","PAN","Form","AY","Due date","Status","Regime","Ack no",""].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-400 py-12 text-sm">
                {filings.length === 0 ? "No ITR filings yet — click \"Generate filings\" to start" : "No filings match your filters"}
              </td></tr>
            ) : filtered.map(f => {
              const days = daysUntil(f.due_date)
              const isEdit = editId === f.id
              return (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.ca_clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{f.ca_clients?.pan ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded font-medium">{f.itr_form}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{f.assessment_year}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{new Date(f.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    {f.status === "pending" && (
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
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLES[f.status]}`}>{STATUS_LABELS[f.status]}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <select value={editRegime} onChange={e => setEditRegime(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none">
                        <option value="">—</option>
                        <option value="new">New</option>
                        <option value="old">Old</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-500 capitalize">{f.regime ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <input type="text" value={editAck} onChange={e => setEditAck(e.target.value)} placeholder="Ack number"
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-32 focus:outline-none" />
                    ) : (
                      <span className="text-xs text-gray-500 font-mono">{f.ack_number ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <div className="flex gap-2 items-center">
                        <input type="date" value={editFiled} onChange={e => setEditFiled(e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                        <button onClick={() => saveEdit(f.id)} disabled={isPending}
                          className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700">Save</button>
                        <button onClick={() => setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(f)} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">Edit</button>
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
