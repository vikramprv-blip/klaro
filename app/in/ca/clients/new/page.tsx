"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const ENTITY_TYPES = ["Individual", "Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited", "HUF", "Trust", "AOP", "Other"]
const CLIENT_TIERS = ["Standard", "Premium", "Enterprise"]
const SERVICES = ["GST Filing", "TDS Filing", "ITR Filing", "Advance Tax", "ROC Compliance", "Bookkeeping", "Payroll", "Audit", "Other"]

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [gstinLooking, setGstinLooking] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [form, setForm] = useState({
    name: "", email: "", phone: "", gstin: "", pan: "",
    entity_type: "Proprietorship", client_type: "individual",
    address: "", city: "", state: "", pincode: "",
    financial_year: "2025-26", tier: "Standard",
    assigned_to: "", notes: ""
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function lookupGSTIN() {
    if (!form.gstin || form.gstin.length !== 15) return
    setGstinLooking(true)
    const res = await fetch(`/api/ca/gstn-search?gstin=${form.gstin}`)
    const data = await res.json()
    if (data.valid) {
      setForm(f => ({
        ...f,
        pan: data.pan || f.pan,
        name: f.name || data.business_name || "",
      }))
    }
    setGstinLooking(false)
  }

  function toggleService(s: string) {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/ca/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, services: selectedServices }),
    })
    if (res.ok) {
      router.push("/in/ca/clients")
    } else {
      const err = await res.json()
      alert(err.error || "Failed to create client")
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
        <p className="text-sm text-gray-500 mt-1">Complete client profile — all fields can be edited later</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Client / Company Name *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Entity Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.entity_type} onChange={e => set("entity_type", e.target.value)}>
                {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Financial Year</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.financial_year} onChange={e => set("financial_year", e.target.value)}>
                {["2025-26", "2024-25", "2023-24"].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phone</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Tax IDs */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Tax Identifiers</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">GSTIN</label>
              <div className="flex gap-2">
                <input className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono uppercase"
                  placeholder="29AAAPL1234C1Z5" maxLength={15}
                  value={form.gstin} onChange={e => set("gstin", e.target.value.toUpperCase())} />
                <button type="button" onClick={lookupGSTIN} disabled={gstinLooking || form.gstin.length !== 15}
                  className="px-3 py-2 border rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40">
                  {gstinLooking ? "..." : "Lookup"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">PAN</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase"
                placeholder="AAAPL1234C" maxLength={10}
                value={form.pan} onChange={e => set("pan", e.target.value.toUpperCase())} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Address</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.address} onChange={e => set("address", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">City</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.city} onChange={e => set("city", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">State</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.state} onChange={e => set("state", e.target.value)}>
                <option value="">Select state</option>
                {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Dadra & Nagar Haveli","Daman & Diu","Lakshadweep","Andaman & Nicobar"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Pincode</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.pincode} onChange={e => set("pincode", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tier</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.tier} onChange={e => set("tier", e.target.value)}>
                {CLIENT_TIERS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Services Required</h2>
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

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Notes</h2>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Any notes about this client..."
            value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {loading ? "Creating..." : "Create Client"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
