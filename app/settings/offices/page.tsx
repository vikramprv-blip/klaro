"use client"
import { useEffect, useState } from "react"

type Office = {
  id: string; name: string; address?: string; city?: string
  state?: string; lat?: number; lng?: number
  radiusMeters: number; isActive: boolean
}

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "",
    lat: "", lng: "", radiusMeters: "200",
  })

  useEffect(() => { fetchOffices() }, [])

  async function fetchOffices() {
    setLoading(true)
    const res = await fetch("/api/firm/offices")
    const data = await res.json()
    setOffices(data.offices || [])
    setLoading(false)
  }

  function detectLocation() {
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }))
        setDetecting(false)
      },
      () => { alert("Could not detect location"); setDetecting(false) }
    )
  }

  async function addOffice(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/firm/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: "", address: "", city: "", state: "", lat: "", lng: "", radiusMeters: "200" })
      fetchOffices()
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/firm/offices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    })
    fetchOffices()
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Office Locations</h1>
          <p className="text-sm text-gray-500 mt-1">Each office has a geo-fence radius for attendance punch-in</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">
          + Add Office
        </button>
      </div>

      {showForm && (
        <form onSubmit={addOffice}
          className="border rounded-2xl p-5 mb-6 bg-gray-50 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-medium">New Office Location</h2>
          <input className="border rounded-xl px-3 py-2 text-sm col-span-2"
            placeholder="Office Name * (e.g. Mumbai HQ, Delhi Branch)"
            value={form.name} required
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2 text-sm col-span-2"
            placeholder="Address" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2 text-sm"
            placeholder="City" value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          <input className="border rounded-xl px-3 py-2 text-sm"
            placeholder="State" value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
          <div className="col-span-2 flex gap-2 items-center">
            <input className="border rounded-xl px-3 py-2 text-sm flex-1"
              placeholder="Latitude" value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
            <input className="border rounded-xl px-3 py-2 text-sm flex-1"
              placeholder="Longitude" value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
            <button type="button" onClick={detectLocation}
              className="px-3 py-2 border rounded-xl text-sm whitespace-nowrap hover:bg-gray-100">
              {detecting ? "Detecting..." : "📍 Use My Location"}
            </button>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">
              Geo-fence radius: {form.radiusMeters}m
              <span className="text-gray-400 ml-2">(employees must be within this distance to punch in)</span>
            </label>
            <input type="range" min="50" max="1000" step="50"
              value={form.radiusMeters}
              onChange={e => setForm(f => ({ ...f, radiusMeters: e.target.value }))}
              className="w-full" />
          </div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-xl text-sm">
              Save Office
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading offices...</p>
      ) : offices.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-sm">No offices yet. Add your first office location above.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {offices.map(o => (
            <div key={o.id}
              className={`border rounded-2xl p-5 flex items-start justify-between ${!o.isActive ? "opacity-50" : ""}`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{o.name}</h3>
                  {!o.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {[o.address, o.city, o.state].filter(Boolean).join(", ") || "No address"}
                </p>
                <div className="flex gap-4 mt-2">
                  {o.lat && o.lng && (
                    <span className="text-xs text-gray-400">📍 {o.lat?.toFixed(4)}, {o.lng?.toFixed(4)}</span>
                  )}
                  <span className="text-xs text-gray-400">🔵 {o.radiusMeters}m radius</span>
                </div>
              </div>
              <button onClick={() => toggleActive(o.id, o.isActive)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  o.isActive
                    ? "text-red-500 border-red-200 hover:bg-red-50"
                    : "text-green-600 border-green-200 hover:bg-green-50"
                }`}>
                {o.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
