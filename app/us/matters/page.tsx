"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"

const MATTER_TYPES = ["Corporate & M&A","Litigation","Real Estate","Estate Planning","Tax","Employment","IP & Patents","Criminal","Family","Bankruptcy","Immigration","Personal Injury","Contract","Other"]
const PRIORITIES = ["low","medium","high","critical"]
const STATUSES = ["active","pending","on_hold","closed"]

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0)
}
function priorityColor(p: string) {
  return p === "critical" ? "bg-red-100 text-red-800" : p === "high" ? "bg-orange-100 text-orange-800" : p === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
}

export default function USMattersPage() {
  const [matters, setMatters] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [tasks, setTasks] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [selectedMatter, setSelectedMatter] = useState<any>(null)
  const [showNew, setShowNew] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"overview"|"tasks"|"time"|"notes">("overview")

  const [form, setForm] = useState({
    title: "", client_name: "", client_email: "", client_phone: "",
    matter_type: "Corporate & M&A", priority: "medium", assigned_to: "",
    opposing_party: "", court: "", jurisdiction: "",
    filing_deadline: "", statute_of_lim: "", opened_date: new Date().toISOString().split("T")[0],
    hourly_rate: "", flat_fee: "", retainer: "", notes: ""
  })
  const [taskForm, setTaskForm] = useState({ title: "", assigned_to: "", due_date: "", priority: "medium", notes: "" })
  const [timeForm, setTimeForm] = useState({ date: new Date().toISOString().split("T")[0], description: "", hours: "", rate: "", attorney: "", matter_id: "" })

  async function load() {
    const r = await fetch(`/api/us/matters?status=${statusFilter}`).then(r => r.json())
    setMatters(r.matters || [])
    setStats(r.stats || {})
    setLoading(false)
  }

  async function loadMatterDetails(id: string) {
    const [tr, ter] = await Promise.all([
      fetch(`/api/us/matters/tasks?matter_id=${id}`).then(r => r.json()),
      fetch(`/api/us/time?matter_id=${id}`).then(r => r.json()),
    ])
    setTasks(Array.isArray(tr) ? tr : [])
    setTimeEntries(Array.isArray(ter) ? ter : [])
  }

  useEffect(() => { load() }, [statusFilter])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("new") === "1") setShowNew(true)
      if (params.get("time") === "1") setShowTime(true)
    }
  }, [])

  async function createMatter(e: any) {
    e.preventDefault(); setSaving(true)
    const res = await fetch("/api/us/matters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!data.error) {
      setShowNew(false)
      setForm({ title: "", client_name: "", client_email: "", client_phone: "", matter_type: "Corporate & M&A", priority: "medium", assigned_to: "", opposing_party: "", court: "", jurisdiction: "", filing_deadline: "", statute_of_lim: "", opened_date: new Date().toISOString().split("T")[0], hourly_rate: "", flat_fee: "", retainer: "", notes: "" })
      load()
    } else alert(data.error)
  }

  async function addTask(e: any) {
    e.preventDefault(); setSaving(true)
    await fetch("/api/us/matters/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...taskForm, matter_id: selectedMatter?.id }) })
    setSaving(false)
    setTaskForm({ title: "", assigned_to: "", due_date: "", priority: "medium", notes: "" })
    if (selectedMatter) loadMatterDetails(selectedMatter.id)
  }

  async function logTime(e: any) {
    e.preventDefault(); setSaving(true)
    const matterId = timeForm.matter_id || selectedMatter?.id
    await fetch("/api/us/time", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...timeForm, matter_id: matterId }) })
    setSaving(false)
    setTimeForm({ date: new Date().toISOString().split("T")[0], description: "", hours: "", rate: "", attorney: "", matter_id: "" })
    setShowTime(false)
    if (selectedMatter) loadMatterDetails(selectedMatter.id)
    load()
  }

  async function updateTask(id: string, status: string) {
    await fetch("/api/us/matters/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    if (selectedMatter) loadMatterDetails(selectedMatter.id)
  }

  async function closeMatter(id: string) {
    if (!confirm("Close this matter?")) return
    await fetch("/api/us/matters", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "closed", closed_date: new Date().toISOString().split("T")[0] }) })
    setSelectedMatter(null); load()
  }

  const filtered = matters.filter(m =>
    !search || m.client_name.toLowerCase().includes(search.toLowerCase()) || m.title.toLowerCase().includes(search.toLowerCase()) || (m.matter_no || "").toLowerCase().includes(search.toLowerCase())
  )

  const today = new Date().toISOString().split("T")[0]

  if (loading) return <div className="p-8 text-gray-400">Loading matters...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Matters</h1>
            <button onClick={() => setShowNew(true)} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium">+ New</button>
          </div>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Search matters..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-1 mt-2">
            {["active","pending","closed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1 text-xs rounded ${statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px bg-gray-200 border-b">
          {[
            { label: "Active", value: stats.active || 0 },
            { label: "Hours", value: `${(stats.total_billed_hours || 0).toFixed(0)}h` },
            { label: "Deadlines", value: stats.deadlines_this_week || 0 },
          ].map(s => (
            <div key={s.label} className="bg-white px-3 py-2 text-center">
              <p className="text-base font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Matter list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              <p className="text-2xl mb-2">⚖</p>
              <p className="text-sm">No matters found</p>
              <button onClick={() => setShowNew(true)} className="mt-3 text-xs text-blue-500 hover:underline">Add your first matter →</button>
            </div>
          )}
          {filtered.map(m => {
            const daysToDeadline = m.filing_deadline ? Math.ceil((new Date(m.filing_deadline).getTime() - Date.now()) / 86400000) : null
            const isUrgent = daysToDeadline !== null && daysToDeadline <= 7
            return (
              <button key={m.id} onClick={() => { setSelectedMatter(m); loadMatterDetails(m.id); setTab("overview") }}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${selectedMatter?.id === m.id ? "bg-blue-50 border-l-2 border-l-blue-600" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.client_name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400 font-mono">{m.matter_no}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColor(m.priority)}`}>{m.priority}</span>
                    </div>
                  </div>
                  {isUrgent && <span className="text-xs text-red-600 font-bold flex-shrink-0">{daysToDeadline}d</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto">
        {/* New Matter Form */}
        {showNew && (
          <div className="p-6">
            <form onSubmit={createMatter} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">New Matter</h2>
                <button type="button" onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Matter Title *</label>
                  <input required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Acme Corp — Series A"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
                  <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Client Email</label>
                  <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Matter Type</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.matter_type} onChange={e => setForm({ ...form, matter_type: e.target.value })}>
                    {MATTER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Priority</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Opposing Party</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.opposing_party} onChange={e => setForm({ ...form, opposing_party: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Court / Jurisdiction</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. SDNY"
                    value={form.jurisdiction} onChange={e => setForm({ ...form, jurisdiction: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Filing Deadline</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.filing_deadline} onChange={e => setForm({ ...form, filing_deadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Statute of Limitations</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.statute_of_lim} onChange={e => setForm({ ...form, statute_of_lim: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Hourly Rate ($)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="350"
                    value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Retainer ($)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="5000"
                    value={form.retainer} onChange={e => setForm({ ...form, retainer: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Assigned To</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Attorney name"
                    value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Notes</label>
                  <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button disabled={saving} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? "Creating..." : "Create Matter"}
                </button>
                <button type="button" onClick={() => setShowNew(false)} className="px-5 py-2.5 border rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Log Time Modal (global) */}
        {showTime && !selectedMatter && (
          <div className="p-6">
            <form onSubmit={logTime} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 max-w-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Log Time</h3>
                <button type="button" onClick={() => setShowTime(false)} className="text-gray-400 text-lg">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Matter</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={timeForm.matter_id} onChange={e => setTimeForm({ ...timeForm, matter_id: e.target.value })}>
                    <option value="">No matter</option>
                    {matters.map(m => <option key={m.id} value={m.id}>{m.client_name} — {m.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={timeForm.date} onChange={e => setTimeForm({ ...timeForm, date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Description *</label>
                  <input required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Drafted motion to dismiss, client call..."
                    value={timeForm.description} onChange={e => setTimeForm({ ...timeForm, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Hours *</label>
                  <input required type="number" step="0.1" className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={timeForm.hours} onChange={e => setTimeForm({ ...timeForm, hours: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Rate ($/hr)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="350"
                    value={timeForm.rate} onChange={e => setTimeForm({ ...timeForm, rate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Attorney</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={timeForm.attorney} onChange={e => setTimeForm({ ...timeForm, attorney: e.target.value })} />
                </div>
                {timeForm.hours && timeForm.rate && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Amount</span>
                    <span className="text-sm font-bold text-green-700">{fmt(Number(timeForm.hours) * Number(timeForm.rate))}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">{saving ? "Saving..." : "Log Time"}</button>
                <button type="button" onClick={() => setShowTime(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Matter Detail */}
        {selectedMatter && !showNew && (
          <div className="p-6 space-y-5">
            {/* Matter Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{selectedMatter.matter_no}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(selectedMatter.priority)}`}>{selectedMatter.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedMatter.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{selectedMatter.status}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMatter.client_name}</h2>
                  <p className="text-gray-600">{selectedMatter.title}</p>
                  {selectedMatter.matter_type && <p className="text-xs text-gray-400 mt-1">{selectedMatter.matter_type}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowTime(true)} className="px-3 py-1.5 border rounded-lg text-xs hover:bg-gray-50">+ Log Time</button>
                  {selectedMatter.status === "active" && (
                    <button onClick={() => closeMatter(selectedMatter.id)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">Close Matter</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                {[
                  { label: "Filing Deadline", value: selectedMatter.filing_deadline || "—", urgent: selectedMatter.filing_deadline && selectedMatter.filing_deadline <= today },
                  { label: "Statute of Lim.", value: selectedMatter.statute_of_lim || "—" },
                  { label: "Billed Hours", value: `${Number(selectedMatter.billed_hours || 0).toFixed(1)}h` },
                  { label: "Retainer", value: selectedMatter.retainer ? fmt(selectedMatter.retainer) : "—" },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-gray-400">{f.label}</p>
                    <p className={`text-sm font-semibold ${(f as any).urgent ? "text-red-600" : "text-gray-900"}`}>{f.value}</p>
                  </div>
                ))}
              </div>

              {(selectedMatter.opposing_party || selectedMatter.jurisdiction || selectedMatter.assigned_to) && (
                <div className="grid grid-cols-3 gap-4 pt-3 border-t mt-3">
                  {[
                    { label: "Opposing Party", value: selectedMatter.opposing_party },
                    { label: "Jurisdiction", value: selectedMatter.jurisdiction },
                    { label: "Assigned To", value: selectedMatter.assigned_to },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label}>
                      <p className="text-xs text-gray-400">{f.label}</p>
                      <p className="text-sm text-gray-700">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {(["overview","tasks","time","notes"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"}`}>
                  {t}{t === "tasks" ? ` (${tasks.length})` : t === "time" ? ` (${timeEntries.length})` : ""}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Matter Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Opened</span><span>{selectedMatter.opened_date}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Client email</span><span>{selectedMatter.client_email || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Client phone</span><span>{selectedMatter.client_phone || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Hourly rate</span><span>{selectedMatter.hourly_rate ? `$${selectedMatter.hourly_rate}/hr` : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Flat fee</span><span>{selectedMatter.flat_fee ? fmt(selectedMatter.flat_fee) : "—"}</span></div>
                  </div>
                </div>
                {selectedMatter.notes && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedMatter.notes}</p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Klaro Sentinel</h3>
                  <p className="text-xs text-blue-700">Sentinel is monitoring this matter for delays and anomalies.</p>
                  <Link href="/us/sentinel" className="text-xs text-blue-600 hover:underline mt-2 inline-block">View Sentinel insights →</Link>
                </div>
              </div>
            )}

            {/* Tasks */}
            {tab === "tasks" && (
              <div className="space-y-4">
                <form onSubmit={addTask} className="bg-white border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Add Task</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3">
                      <input required placeholder="Task title *" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                    </div>
                    <div>
                      <input placeholder="Assigned to" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={taskForm.assigned_to} onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })} />
                    </div>
                    <div>
                      <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                    </div>
                    <div>
                      <select className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">{saving ? "Adding..." : "Add Task"}</button>
                </form>
                <div className="bg-white border rounded-xl overflow-hidden">
                  {tasks.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No tasks yet</p>}
                  {tasks.map(t => {
                    const isOverdue = t.due_date && t.due_date < today && t.status !== "done"
                    return (
                      <div key={t.id} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${isOverdue ? "bg-red-50" : ""}`}>
                        <input type="checkbox" checked={t.status === "done"}
                          onChange={() => updateTask(t.id, t.status === "done" ? "todo" : "done")}
                          className="rounded" />
                        <div className="flex-1">
                          <p className={`text-sm ${t.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>{t.title}</p>
                          <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                            {t.assigned_to && <span>{t.assigned_to}</span>}
                            {t.due_date && <span className={isOverdue ? "text-red-600 font-semibold" : ""}>Due {t.due_date}</span>}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColor(t.priority)}`}>{t.priority}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Time */}
            {tab === "time" && (
              <div className="space-y-4">
                <form onSubmit={logTime} className="bg-white border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Log Time</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={timeForm.date} onChange={e => setTimeForm({ ...timeForm, date: e.target.value })} />
                    </div>
                    <div>
                      <input type="number" step="0.1" placeholder="Hours *" required className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={timeForm.hours} onChange={e => setTimeForm({ ...timeForm, hours: e.target.value })} />
                    </div>
                    <div>
                      <input type="number" placeholder="Rate ($/hr)" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={timeForm.rate} onChange={e => setTimeForm({ ...timeForm, rate: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <input required placeholder="Description *" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={timeForm.description} onChange={e => setTimeForm({ ...timeForm, description: e.target.value })} />
                    </div>
                    <div>
                      <input placeholder="Attorney" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={timeForm.attorney} onChange={e => setTimeForm({ ...timeForm, attorney: e.target.value })} />
                    </div>
                  </div>
                  {timeForm.hours && timeForm.rate && (
                    <div className="bg-green-50 rounded-lg px-4 py-2 inline-block text-sm">
                      Amount: <strong>{fmt(Number(timeForm.hours) * Number(timeForm.rate))}</strong>
                    </div>
                  )}
                  <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">{saving ? "Saving..." : "Log Time"}</button>
                </form>

                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Time Entries</h3>
                    <div className="text-sm text-gray-500">
                      Total: <strong>{timeEntries.reduce((s, t) => s + Number(t.hours || 0), 0).toFixed(1)}h</strong>
                      {" · "}
                      <strong className="text-green-700">{fmt(timeEntries.reduce((s, t) => s + Number(t.amount || 0), 0))}</strong>
                    </div>
                  </div>
                  {timeEntries.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No time logged yet</p>}
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                      <tr>{["Date","Description","Attorney","Hours","Rate","Amount"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {timeEntries.map(t => (
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-500">{t.date}</td>
                          <td className="px-4 py-2 text-gray-700">{t.description}</td>
                          <td className="px-4 py-2 text-gray-500">{t.attorney || "—"}</td>
                          <td className="px-4 py-2 font-medium">{t.hours}h</td>
                          <td className="px-4 py-2 text-gray-500">{t.rate ? `$${t.rate}` : "—"}</td>
                          <td className="px-4 py-2 font-semibold text-green-700">{t.amount ? fmt(t.amount) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {tab === "notes" && (
              <div className="bg-white border rounded-xl p-5">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMatter.notes || "No notes added yet."}</p>
              </div>
            )}
          </div>
        )}

        {/* Empty state when nothing selected */}
        {!selectedMatter && !showNew && !showTime && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center text-gray-400">
              <p className="text-4xl mb-3">⚖</p>
              <p className="text-sm">Select a matter to view details</p>
              <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Create your first matter</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
