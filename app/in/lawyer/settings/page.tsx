"use client"
import { useEffect, useState } from "react"

const FIELDS = [
  { key: "name",         label: "Firm Name",          required: true },
  { key: "admin_name",   label: "Admin / Partner Name", required: true },
  { key: "email",        label: "Email" },
  { key: "phone",        label: "Phone" },
  { key: "address",      label: "Address" },
  { key: "city",         label: "City" },
  { key: "state",        label: "State" },
  { key: "pincode",      label: "Pincode" },
  { key: "gst_number",   label: "GST Number" },
  { key: "bar_council",  label: "Bar Council Registration No." },
]

export default function LawyerSettingsPage() {
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/lawyer/settings")
      .then(r => r.json())
      .then(d => { setForm(d || {}); setLoading(false) })
  }, [])

  async function handleSave(e: any) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/lawyer/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Firm Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Company profile, contact info and billing details</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Firm Profile</h2>
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form[f.key] || ""}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.required}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-green-600 text-sm">✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  )
}
