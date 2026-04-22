"use client"
import { useState, useEffect } from "react"

type Hearing = {
  id: string
  matter_id: string
  hearing_date: string
  court: string | null
  purpose: string | null
  outcome: string | null
  next_date: string | null
  notes: string | null
  legal_matters?: { client_name: string; matter_title: string }
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default function HearingsPage() {
  const [hearings, setHearings]   = useState<Hearing[]>([])
  const [matters, setMatters]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState<"upcoming"|"past">("upcoming")
  const [form, setForm]           = useState({
    matter_id: "", hearing_date: "", court: "", purpose: "", next_date: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/lawyer/hearings").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ]).then(([h, m]) => {
      setHearings(Array.isArray(h) ? h : [])
      setMatters(Array.isArray(m) ? m : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const filtered = hearings.filter(h =>
    filter === "upcoming" ? h.hearing_date >= today : h.hearing_date < today
  ).sort((a,b) => filter === "upcoming"
    ? new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime()
    : new Date(b.hearing_date).getTime() - new Date(a.hearing_date).getTime()
  )

  const thisWeek = hearings.filter(h => { const d = daysUntil(h.hearing_date); return d >= 0 && d <= 7 }).length
  const today_count = hearings.filter(h => h.hearing_date === today).length

  async function handleCreate() {
    if (!form.matter_id || !form.hearing_date) return
    setSaving(true)
    const res = await fetch("/api/lawyer/hearings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    })
    const created = await res.json()
    if (created.id) {
      const matter = matters.find(m => m.id === form.matter_id)
      setHearings(prev => [...prev, { ...created, legal_matters: matter ? { client_name: matter.client_name, matter_title: matter.matter_title } : undefined }])
    }
    setShowForm(false)
    setForm({ matter_id:"", hearing_date:"", court:"", purpose:"", next_date:"" })
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Hearings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Court dates and hearing tracker</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">
          + Add hearing
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Today",     value: today_count, color: today_count > 0 ? "text-red-600" : "text-gray-900" },
          { label: "This week", value: thisWeek,    color: thisWeek > 0 ? "text-amber-600" : "text-gray-900" },
          { label: "Total",     value: hearings.length, color: "text-gray-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Add hearing</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Matter *</label>
              <select value={form.matter_id} onChange={e => setForm(p => ({...p, matter_id: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                <option value="">Select matter...</option>
                {matters.filter(m => m.status === "active").map(m => (
                  <option key={m.id} value={m.id}>{m.client_name} — {m.matter_title}</option>
                ))}
              </select>
            </div>
            {[
              { key: "hearing_date", label: "Hearing date *", type: "date" },
              { key: "next_date",    label: "Next date",      type: "date" },
              { key: "court",        label: "Court",          type: "text" },
              { key: "purpose",      label: "Purpose",        type: "text" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={!form.matter_id || !form.hearing_date || saving}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40">
              {saving ? "Saving..." : "Save hearing"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(["upcoming","past"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg capitalize ${filter === f ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">No {filter} hearings</div>
        ) : filtered.map(h => {
          const days = daysUntil(h.hearing_date)
          return (
            <div key={h.id} className={`border rounded-xl p-4 flex items-center gap-4 ${days >= 0 && days <= 3 ? "border-amber-200 bg-amber-50/30" : "border-gray-100"}`}>
              <div className="text-center min-w-14">
                <p className="text-2xl font-semibold text-gray-800">{new Date(h.hearing_date).getDate()}</p>
                <p className="text-xs text-gray-400">{new Date(h.hearing_date).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{h.legal_matters?.client_name ?? "—"}</p>
                <p className="text-xs text-gray-500">{h.legal_matters?.matter_title ?? "—"}</p>
                {h.purpose && <p className="text-xs text-gray-400 mt-0.5">{h.purpose}</p>}
              </div>
              <div className="text-right">
                {h.court && <p className="text-xs text-gray-500">{h.court}</p>}
                {filter === "upcoming" && (
                  <p className={`text-xs font-medium mt-1 ${days === 0 ? "text-red-600" : days <= 3 ? "text-amber-600" : "text-gray-400"}`}>
                    {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
                  </p>
                )}
                {h.next_date && (
                  <p className="text-xs text-gray-400 mt-1">Next: {new Date(h.next_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
