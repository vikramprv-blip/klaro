"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

const ENTITY_TYPES = ["Individual", "Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited", "HUF", "Trust", "AOP", "Other"]
const SERVICES = ["GST Filing", "TDS Filing", "ITR Filing", "Advance Tax", "ROC Compliance", "Bookkeeping", "Payroll", "Audit", "Other"]

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (!id) return
    fetch(`/api/ca/clients/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm(data)
        setSelectedServices(data.services || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function set(key: string, value: string) {
    setForm((f: any) => ({ ...f, [key]: value }))
  }

  function toggleService(s: string) {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function handleSave(e: any) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/ca/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, services: selectedServices }),
    })
    setSaving(false)
    if (res.ok) router.push("/in/ca/clients")
    else alert("Failed to save")
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-sm text-gray-500 mt-1">{form.name}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Client / Company Name *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.name || ""} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Entity Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.entity_type || ""} onChange={e => set("entity_type", e.target.value)}>
                {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.email || ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phone</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">GSTIN</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase"
                maxLength={15} value={form.gstin || ""} onChange={e => set("gstin", e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">PAN</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase"
                maxLength={10} value={form.pan || ""} onChange={e => set("pan", e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Address</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.address || ""} onChange={e => set("address", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">City</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.city || ""} onChange={e => set("city", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">State</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.state || ""} onChange={e => set("state", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Pincode</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.pincode || ""} onChange={e => set("pincode", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Services</h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedServices.includes(s) ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="text-xs text-gray-500 block mb-1">Notes</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            value={form.notes || ""} onChange={e => set("notes", e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/in/ca/clients")}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
