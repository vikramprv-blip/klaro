"use client"
import SearchableSelect from "@/components/SearchableSelect"
// ── app/lawyer/tasks/page.tsx ────────────────────────────────────────────────
import { useState, useEffect } from "react"

type Task = {
  id: string
  matter_id: string
  title: string
  due_date: string | null
  status: string
  priority: string
  assigned_to: string | null
  legal_matters?: { client_name: string; matter_title: string }
}

const STATUS_STYLES: Record<string,string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done:        "bg-green-50 text-green-700 border-green-200",
  skipped:     "bg-gray-50 text-gray-400 border-gray-200",
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default function TasksPage() {
  const [tasks, setTasks]       = useState<Task[]>([])
  const [matters, setMatters]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [filterStatus, setFS]   = useState("all")
  const [form, setForm]         = useState({ matter_id:"", title:"", due_date:"", priority:"medium", assigned_to:"" })

  useEffect(() => {
    Promise.all([
      fetch("/api/lawyer/tasks").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ]).then(([t,m]) => {
      setTasks(Array.isArray(t) ? t : [])
      setMatters(Array.isArray(m) ? m : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t => filterStatus === "all" || t.status === filterStatus)
  const overdue  = tasks.filter(t => t.due_date && daysUntil(t.due_date) < 0 && t.status !== "done").length
  const pending  = tasks.filter(t => t.status === "pending").length
  const done     = tasks.filter(t => t.status === "done").length

  async function handleCreate() {
    if (!form.matter_id || !form.title) return
    setSaving(true)
    const res = await fetch("/api/lawyer/tasks", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    })
    const created = await res.json()
    if (Array.isArray(created) && created[0]) {
      const matter = matters.find(m => m.id === form.matter_id)
      setTasks(prev => [...prev, { ...created[0], legal_matters: matter ? { client_name: matter.client_name, matter_title: matter.matter_title } : undefined }])
    }
    setShowForm(false)
    setForm({ matter_id:"", title:"", due_date:"", priority:"medium", assigned_to:"" })
    setSaving(false)
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "pending" ? "in_progress" : current === "in_progress" ? "done" : "pending"
    await fetch(`/api/lawyer/tasks/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }),
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-400 mt-0.5">Case timeline tasks across all matters</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Add task</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Overdue", value: overdue, color: overdue > 0 ? "text-red-600" : "text-gray-900" },
          { label: "Pending", value: pending, color: "text-amber-600" },
          { label: "Done",    value: done,    color: "text-green-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700 mb-4">New task</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Matter *</label>
              {/* matter_id select replaced by SearchableSelect */}
              <SearchableSelect
                options={[{value:"",label:"No matter"}, ...(matters||[]).map((m:any)=>({value:m.id,label:`${m.client_name} — ${m.matter_title||m.title||"Matter"}`,sub:m.cnr_number||m.court||""}))]}
                value={form.matter_id||""}
                onChange={val=>setForm({...form,matter_id:val})}
                placeholder="Search matter or client..."
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Task title *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                {["urgent","high","medium","low"].map(v => <option key={v} value={v} className="capitalize">{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={!form.matter_id || !form.title || saving}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40">
              {saving ? "Saving..." : "Save task"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {["all","pending","in_progress","done"].map(s => (
          <button key={s} onClick={() => setFS(s)}
            className={`text-xs px-3 py-1.5 rounded-lg capitalize ${filterStatus === s ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            {s.replace("_"," ")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? [...Array(4)].map((_,i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />) :
        filtered.length === 0 ? <div className="text-center text-gray-400 py-10 text-sm">No tasks found</div> :
        filtered.map(t => {
          const days = t.due_date ? daysUntil(t.due_date) : null
          return (
            <div key={t.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50">
              <button onClick={() => toggleStatus(t.id, t.status)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  t.status === "done" ? "bg-green-500 border-green-500" : t.status === "in_progress" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                }`}>
                {(t.status === "done" || t.status === "in_progress") && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>{t.title}</p>
                <p className="text-xs text-gray-400">{t.legal_matters?.client_name} · {t.legal_matters?.matter_title}</p>
              </div>
              {t.due_date && (
                <div className={`text-xs ${days !== null && days < 0 && t.status !== "done" ? "text-red-500" : "text-gray-400"}`}>
                  {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : t.due_date && new Date(t.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                </div>
              )}
              <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[t.status]}`}>{t.status.replace("_"," ")}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
