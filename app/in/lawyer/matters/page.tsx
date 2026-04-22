"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

type Matter = {
  id: string
  client_name: string
  matter_title: string
  matter_type: string
  court: string | null
  case_number: string | null
  next_date: string | null
  status: string
  priority: string
  assigned_to: string | null
}

const STATUS_STYLES: Record<string,string> = {
  active:    "bg-green-50 text-green-700 border-green-200",
  adjourned: "bg-amber-50 text-amber-700 border-amber-200",
  disposed:  "bg-blue-50 text-blue-700 border-blue-200",
  closed:    "bg-gray-50 text-gray-500 border-gray-200",
  stayed:    "bg-purple-50 text-purple-700 border-purple-200",
}

const PRIORITY_STYLES: Record<string,string> = {
  urgent: "bg-red-50 text-red-700",
  high:   "bg-orange-50 text-orange-700",
  medium: "bg-gray-50 text-gray-600",
  low:    "bg-gray-50 text-gray-400",
}

const MATTER_TYPES = ["civil","criminal","family","corporate","property","labour","tax","constitutional","consumer","arbitration","other"]

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default function MattersPage() {
  const [matters, setMatters]     = useState<Matter[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filterStatus, setFStat]  = useState("all")
  const [filterType, setFType]    = useState("all")
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({
    client_name: "", matter_title: "", matter_type: "civil",
    court: "", case_number: "", next_date: "", priority: "medium", assigned_to: "",
  })

  useEffect(() => {
    fetch("/api/lawyer/matters").then(r => r.json())
      .then(d => { setMatters(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = matters.filter(m => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false
    if (filterType !== "all" && m.matter_type !== filterType) return false
    if (search && !m.client_name.toLowerCase().includes(search.toLowerCase()) &&
        !m.matter_title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const urgent    = matters.filter(m => m.priority === "urgent" && m.status === "active").length
  const hearingSoon = matters.filter(m => m.next_date && daysUntil(m.next_date) >= 0 && daysUntil(m.next_date) <= 7).length
  const active    = matters.filter(m => m.status === "active").length

  async function handleCreate() {
    setSaving(true)
    const res = await fetch("/api/lawyer/matters", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    })
    const created = await res.json()
    if (created.id) setMatters(prev => [created, ...prev])
    setShowForm(false)
    setForm({ client_name:"", matter_title:"", matter_type:"civil", court:"", case_number:"", next_date:"", priority:"medium", assigned_to:"" })
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Matters</h1>
          <p className="text-sm text-gray-400 mt-0.5">{matters.length} total matters</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">
          + New matter
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Active matters",  value: active,      color: "text-gray-900" },
          { label: "Urgent",          value: urgent,      color: urgent > 0 ? "text-red-600" : "text-gray-900" },
          { label: "Hearing this week", value: hearingSoon, color: hearingSoon > 0 ? "text-amber-600" : "text-gray-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-4">New matter</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key:"client_name",   label:"Client name *",  type:"text",    span:2 },
              { key:"priority",      label:"Priority",        type:"sel-pri", span:1 },
              { key:"matter_title",  label:"Matter title *",  type:"text",    span:3 },
              { key:"matter_type",   label:"Type",            type:"sel-type",span:1 },
              { key:"court",         label:"Court",           type:"text",    span:1 },
              { key:"case_number",   label:"Case number",     type:"text",    span:1 },
              { key:"next_date",     label:"Next hearing",    type:"date",    span:1 },
              { key:"assigned_to",   label:"Assigned to",     type:"text",    span:2 },
            ].map(({ key, label, type, span }) => (
              <div key={key} className={span === 3 ? "col-span-3" : span === 2 ? "col-span-2" : ""}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                {type === "sel-pri" ? (
                  <select value={(form as any)[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                    {["urgent","high","medium","low"].map(v => <option key={v} value={v} className="capitalize">{v}</option>)}
                  </select>
                ) : type === "sel-type" ? (
                  <select value={(form as any)[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                    {MATTER_TYPES.map(v => <option key={v} value={v} className="capitalize">{v}</option>)}
                  </select>
                ) : (
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={!form.client_name || !form.matter_title || saving}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40">
              {saving ? "Saving..." : "Save matter"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Search client or matter..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-gray-400" />
        <select value={filterStatus} onChange={e => setFStat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All statuses</option>
          {["active","adjourned","disposed","closed","stayed"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400">
          <option value="all">All types</option>
          {MATTER_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} matters</span>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Client","Matter","Type","Court","Next hearing","Priority","Status",""].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center"><div className="animate-pulse text-gray-300">Loading...</div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-400 py-12 text-sm">
                {matters.length === 0 ? "No matters yet — add your first matter above" : "No matters match your filters"}
              </td></tr>
            ) : filtered.map(m => {
              const days = m.next_date ? daysUntil(m.next_date) : null
              return (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.client_name}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-48 truncate">{m.matter_title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{m.matter_type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.court ?? "—"}</td>
                  <td className="px-4 py-3">
                    {m.next_date ? (
                      <>
                        <div className="text-gray-700 text-xs">{new Date(m.next_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</div>
                        {days !== null && (
                          <div className={`text-xs mt-0.5 ${days < 0 ? "text-red-500" : days <= 3 ? "text-red-400" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}>
                            {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `in ${days}d`}
                          </div>
                        )}
                      </>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${PRIORITY_STYLES[m.priority]}`}>{m.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[m.status]}`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/lawyer/matters/${m.id}`} className="text-xs text-blue-500 hover:underline">Open →</Link>
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
