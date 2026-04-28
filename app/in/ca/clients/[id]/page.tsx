"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

const STATES = ["","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Dadra & Nagar Haveli","Daman & Diu","Lakshadweep","Andaman & Nicobar"]
const SERVICES = ["GST Filing","TDS Filing","ITR Filing","Advance Tax","ROC Compliance","Bookkeeping","Payroll","Audit","Other"]

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [services, setServices] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    fetch(`/api/ca/clients/${id}`)
      .then(r => r.json())
      .then(data => {
        setClient(data)
        setForm({
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          notes: data.notes || "",
        })
        setServices(data.services || [])
        setLoading(false)
      })
  }, [id])

  function toggleService(s: string) {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function handleSave(e: any) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/ca/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, services }),
    })
    setSaving(false)
    if (res.ok) router.push("/in/ca/clients")
    else alert("Failed to save changes")
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!client) return <div className="p-8 text-red-500">Client not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-sm text-gray-500 mt-1">{client.name}</p>
      </div>

      {/* Read-only identity fields */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          Identity — Read Only
          <span className="text-xs font-normal text-gray-400 normal-case">(GST, PAN and entity details cannot be changed)</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Client Name", value: client.name },
            { label: "Entity Type", value: client.entity_type || "—" },
            { label: "GSTIN", value: client.gstin || "—" },
            { label: "PAN", value: client.pan || "—" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
              <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-500 select-none">{f.value}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-600">To change GSTIN, PAN or entity type, please contact support@klaro.services with supporting documents.</p>
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phone</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Address</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">City</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">State</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                {STATES.map(s => <option key={s} value={s}>{s || "Select state"}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Pincode</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Services</h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${services.includes(s) ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="text-xs text-gray-500 block mb-1">Notes</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/in/ca/clients")}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  )
}
