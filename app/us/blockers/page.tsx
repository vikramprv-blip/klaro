"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function BlockerDashboard() {
  const [blockers, setBlockers] = useState<any[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"blockers"|"collab">("blockers")
  const [showForm, setShowForm] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", blocked_by_firm: "", blocking_firm: "", severity: "medium", deadline: "" })
  const [inviteForm, setInviteForm] = useState({ partner_firm_email: "", partner_firm_name: "", client_name: "", matter_ref: "" })

  async function load() {
    const [br, lr] = await Promise.all([
      fetch("/api/us/blockers").then(r => r.json()),
      fetch("/api/us/cross-firm").then(r => r.json()),
    ])
    setBlockers(br.blockers || [])
    setStats(br.stats || {})
    setLinks(Array.isArray(lr) ? lr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addBlocker(e: any) {
    e.preventDefault(); setSaving(true)
    await fetch("/api/us/blockers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setSaving(false); setShowForm(false)
    setForm({ title: "", description: "", blocked_by_firm: "", blocking_firm: "", severity: "medium", deadline: "" })
    load()
  }

  async function sendInvite(e: any) {
    e.preventDefault(); setSaving(true)
    await fetch("/api/us/cross-firm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inviteForm) })
    setSaving(false); setShowInvite(false)
    setInviteForm({ partner_firm_email: "", partner_firm_name: "", client_name: "", matter_ref: "" })
    load()
  }

  async function resolve(id: string) {
    await fetch("/api/us/blockers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "resolved" }) })
    load()
  }

  const severityColor = (s: string) => s === "critical" ? "bg-red-100 text-red-800 border border-red-200" : s === "high" ? "bg-orange-100 text-orange-800" : s === "medium" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"

  if (loading) return <div className="p-8 text-gray-400">Loading blocker dashboard...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cross-Firm Blocker Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Eliminate blocker blindness between your firm and partner firms</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInvite(s => !s)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100">
              + Invite Firm
            </button>
            <button onClick={() => setShowForm(s => !s)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
              + Add Blocker
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Blockers", value: stats.total || 0, color: "bg-blue-50 text-blue-900" },
            { label: "Active", value: stats.active || 0, color: "bg-amber-50 text-amber-900" },
            { label: "Escalated (3d+)", value: stats.escalated || 0, color: "bg-orange-50 text-orange-900" },
            { label: "Critical", value: stats.critical || 0, color: "bg-red-50 text-red-900" },
            { label: "Resolved", value: stats.resolved || 0, color: "bg-green-50 text-green-900" },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
              <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* How it works banner */}
        {blockers.length === 0 && links.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">How cross-firm collaboration works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div><span className="font-bold">1.</span> Invite your client's attorney or CPA using the "Invite Firm" button</div>
              <div><span className="font-bold">2.</span> Add blockers — tasks that are blocked because the other firm hasn't delivered yet</div>
              <div><span className="font-bold">3.</span> Both firms see the blockers in real-time. Auto-escalation after 3 days.</div>
            </div>
          </div>
        )}

        {/* Invite form */}
        {showInvite && (
          <form onSubmit={sendInvite} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Invite Partner Firm</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Partner Firm Name</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Greene & Associates CPA"
                  value={inviteForm.partner_firm_name} onChange={e => setInviteForm({ ...inviteForm, partner_firm_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Partner Firm Email *</label>
                <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="contact@greeneassoc.com"
                  value={inviteForm.partner_firm_email} onChange={e => setInviteForm({ ...inviteForm, partner_firm_email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Client Name *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Acme Corp"
                  value={inviteForm.client_name} onChange={e => setInviteForm({ ...inviteForm, client_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Matter Reference</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="M&A — Acme Corp acquisition"
                  value={inviteForm.matter_ref} onChange={e => setInviteForm({ ...inviteForm, matter_ref: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">{saving ? "Sending..." : "Send Invitation"}</button>
              <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        )}

        {/* Add blocker form */}
        {showForm && (
          <form onSubmit={addBlocker} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Blocker</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Blocker Title *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Waiting on audit report from Greene & Associates"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Your Firm (blocked by)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Smith Law LLP"
                  value={form.blocked_by_firm} onChange={e => setForm({ ...form, blocked_by_firm: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Blocking Firm (waiting on)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Greene & Associates CPA"
                  value={form.blocking_firm} onChange={e => setForm({ ...form, blocking_firm: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Severity</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                  {["low","medium","high","critical"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Deadline</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">{saving ? "Saving..." : "Add Blocker"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {[{ key: "blockers", label: `Blockers (${stats.active || 0} active)` }, { key: "collab", label: `Partner Firms (${links.length})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "blockers" && (
          <div className="bg-white border rounded-xl overflow-hidden">
            {blockers.length === 0 && (
              <div className="px-5 py-12 text-center text-gray-400">
                <p className="text-3xl mb-2">🔗</p>
                <p className="text-sm">No blockers yet. Add a blocker when you're waiting on another firm.</p>
              </div>
            )}
            {blockers.map(b => (
              <div key={b.id} className={`px-5 py-4 border-b last:border-0 flex items-start justify-between ${b.escalated && b.status === "active" ? "bg-red-50/30" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-gray-900">{b.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColor(b.severity)}`}>{b.severity}</span>
                    {b.escalated && b.status === "active" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">⚠ ESCALATED</span>
                    )}
                    {b.status === "resolved" && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">✓ Resolved</span>}
                  </div>
                  {b.description && <p className="text-sm text-gray-500 mb-1">{b.description}</p>}
                  <div className="flex gap-4 text-xs text-gray-400">
                    {b.blocked_by_firm && <span>🏢 {b.blocked_by_firm}</span>}
                    {b.blocking_firm && <span>⏳ Waiting on: <strong className="text-gray-600">{b.blocking_firm}</strong></span>}
                    <span>🕐 {b.days_blocked} day{b.days_blocked !== 1 ? "s" : ""} blocked</span>
                    {b.deadline && <span>📅 Due: {b.deadline}</span>}
                  </div>
                </div>
                {b.status === "active" && (
                  <button onClick={() => resolve(b.id)}
                    className="ml-4 flex-shrink-0 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "collab" && (
          <div className="bg-white border rounded-xl overflow-hidden">
            {links.length === 0 && (
              <div className="px-5 py-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📨</p>
                <p className="text-sm">No partner firms yet. Invite a firm to start collaborating on shared clients.</p>
              </div>
            )}
            {links.map(l => (
              <div key={l.id} className="px-5 py-4 border-b last:border-0 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{l.partner_firm_name || l.partner_firm_email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Client: <strong>{l.client_name}</strong> {l.matter_ref ? `· ${l.matter_ref}` : ""}</p>
                  <p className="text-xs text-gray-400">{l.partner_firm_email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${l.status === "accepted" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
