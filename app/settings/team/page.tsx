"use client"
import { useEffect, useState } from "react"

const ROLES = ["Admin", "Senior CA", "CA", "Tax Associate", "Audit Associate", "Intern", "Staff", "Accountant"]
const DEPARTMENTS = ["Audit", "GST", "TDS", "ITR", "Legal", "Payroll", "Admin", "Management"]

type Member = {
  id: string; name: string; email: string; phone?: string
  role: string; department?: string; status: string
  branch?: { name: string }
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Staff", department: "" })

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    const res = await fetch("/api/firm/members")
    const data = await res.json()
    setMembers(data.members || [])
    setLoading(false)
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/firm/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: "", email: "", phone: "", role: "Staff", department: "" })
      fetchMembers()
    }
  }

  async function updateRole(id: string, role: string) {
    await fetch("/api/firm/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    })
    fetchMembers()
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this team member?")) return
    await fetch("/api/firm/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchMembers()
  }

  const active = members.filter(m => m.status === "active")
  const inactive = members.filter(m => m.status !== "active")

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">{active.length} active · {inactive.length} inactive</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">
          + Add Member
        </button>
      </div>

      {showForm && (
        <form onSubmit={addMember}
          className="border rounded-2xl p-5 mb-6 bg-gray-50 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-medium">New Team Member</h2>
          <input className="border rounded-xl px-3 py-2 text-sm" placeholder="Full Name *"
            value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2 text-sm" placeholder="Email *" type="email"
            value={form.email} required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2 text-sm" placeholder="Phone"
            value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <select className="border rounded-xl px-3 py-2 text-sm"
            value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="border rounded-xl px-3 py-2 text-sm col-span-2"
            value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-xl text-sm">Add Member</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading team...</p>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">No team members yet. Add your first staff member above.</p>
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Name", "Email", "Role", "Department", "Branch", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 ${m.status !== "active" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.email}</td>
                  <td className="px-4 py-3">
                    <select className="text-xs border rounded-lg px-2 py-1 bg-white"
                      value={m.role}
                      onChange={e => updateRole(m.id, e.target.value)}>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.department || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{m.branch?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {m.status === "active" && (
                      <button onClick={() => deactivate(m.id)}
                        className="text-xs text-red-500 hover:text-red-700">Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
