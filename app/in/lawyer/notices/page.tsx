"use client"
import { useEffect, useState } from "react"

export default function LegalNoticesPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ matter_id: "", notice_type: "Section 138 NI Act", addressee_name: "", addressee_addr: "", subject: "", facts: "" })

  async function load() {
    const [nr, mr] = await Promise.all([
      fetch("/api/lawyer/notices").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ])
    setNotices(nr.notices || [])
    setTypes(nr.types || [])
    setMatters(Array.isArray(mr) ? mr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(e: any) {
    e.preventDefault()
    setGenerating(true)
    const res = await fetch("/api/lawyer/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, generate: true })
    })
    const data = await res.json()
    setGenerating(false)
    if (data.id) { setSelected(data); load() }
  }

  async function handleSave() {
    if (!selected) return
    await fetch("/api/lawyer/notices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, draft_content: selected.draft_content, status: selected.status })
    })
    load()
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal Notice Generator</h1>
        <p className="text-sm text-gray-500 mt-1">AI-drafted notices under NI Act, IBC, Consumer Protection, RERA and more</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left — Generator */}
        <div className="col-span-2 space-y-4">
          <form onSubmit={handleGenerate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Generate Notice</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notice Type *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.notice_type} onChange={e => setForm({ ...form, notice_type: e.target.value })}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Matter (optional)</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.matter_id} onChange={e => setForm({ ...form, matter_id: e.target.value })}>
                <option value="">No matter linked</option>
                {matters.map(m => <option key={m.id} value={m.id}>{m.client_name} — {m.matter_title || m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Addressee Name *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.addressee_name} onChange={e => setForm({ ...form, addressee_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Addressee Address</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.addressee_addr} onChange={e => setForm({ ...form, addressee_addr: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Subject *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Key Facts *</label>
              <textarea required rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Describe the key facts — cheque amount, date, parties, what happened..."
                value={form.facts} onChange={e => setForm({ ...form, facts: e.target.value })} />
            </div>
            <button disabled={generating} className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
              {generating ? "Generating with AI..." : "⚡ Generate Draft"}
            </button>
          </form>
        </div>

        {/* Right — Editor + List */}
        <div className="col-span-3 space-y-4">
          {selected && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">{selected.notice_type}</h2>
                <div className="flex gap-2">
                  <select className="text-xs border rounded px-2 py-1"
                    value={selected.status}
                    onChange={e => setSelected({ ...selected, status: e.target.value })}>
                    {["draft", "reviewed", "sent"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={handleSave} className="px-3 py-1 bg-gray-900 text-white rounded text-xs">Save</button>
                  <button onClick={() => { navigator.clipboard.writeText(selected.draft_content) }} className="px-3 py-1 border rounded text-xs">Copy</button>
                </div>
              </div>
              <textarea rows={16} className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none"
                value={selected.draft_content}
                onChange={e => setSelected({ ...selected, draft_content: e.target.value })} />
            </div>
          )}

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">All Notices ({notices.length})</h2>
            </div>
            {notices.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No notices generated yet</p>}
            {notices.map(n => (
              <div key={n.id} onClick={() => setSelected(n)}
                className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${selected?.id === n.id ? "bg-blue-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{n.notice_type}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${n.status === "sent" ? "bg-green-50 text-green-700" : n.status === "reviewed" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                    {n.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">To: {n.addressee_name} · {new Date(n.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
