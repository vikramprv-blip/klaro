"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const FIELDS = [
  { key: "name",       label: "Firm Name",           required: true },
  { key: "admin_name", label: "Admin / Partner Name", required: true },
  { key: "email",      label: "Firm Email" },
  { key: "phone",      label: "Phone" },
  { key: "address",    label: "Address" },
  { key: "city",       label: "City" },
  { key: "state",      label: "State" },
  { key: "pincode",    label: "Pincode" },
  { key: "gst_number", label: "GST Number" },
]

export default function CASettingsPage() {
  const [form, setForm]             = useState<any>({})
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [loading, setLoading]       = useState(true)
  const [isFirmAdmin, setIsFirmAdmin] = useState(false)
  const [token, setToken]           = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const t = session?.access_token || ""
      setToken(t)
      const res = await fetch("/api/ca/settings", {
        headers: { "Authorization": `Bearer ${t}` }
      })
      const data = await res.json()
      setForm(data || {})
      setIsFirmAdmin(data?.is_firm_admin || false)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: any) {
    e.preventDefault()
    if (!isFirmAdmin) return
    setSaving(true)
    const res = await fetch("/api/ca/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
        <p className="text-sm text-gray-500 mt-1">Company profile, GST details and contact information</p>
        {!isFirmAdmin && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <span className="text-amber-600 text-sm">🔒 Only your firm admin can edit these settings. Contact your admin to make changes.</span>
          </div>
        )}
        {isFirmAdmin && (
          <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <span className="text-green-700 text-sm">✓ You are the firm admin — you can edit all settings.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className={`bg-white border border-gray-200 rounded-xl p-6 space-y-4 ${!isFirmAdmin ? "opacity-60 pointer-events-none select-none" : ""}`}>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Firm Profile</h2>
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
                value={form[f.key] || ""}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.required}
                disabled={!isFirmAdmin}
              />
            </div>
          ))}
        </div>

        {isFirmAdmin && (
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Saved successfully</span>}
          </div>
        )}
      </form>

      {isFirmAdmin && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Team Management</h2>
          <p className="text-sm text-gray-500">As firm admin, you can invite team members and manage their roles.</p>
          <a href="/settings/team" className="inline-block px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            Manage team →
          </a>
        </div>
      )}
    </div>
  )
}
