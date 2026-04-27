"use client"
import { useState } from "react"

export default function CAToolsPage() {
  const [gstinInput, setGstinInput] = useState("")
  const [gstinResult, setGstinResult] = useState<any>(null)
  const [gstinLoading, setGstinLoading] = useState(false)
  const [nicQuery, setNicQuery] = useState("")
  const [nicResults, setNicResults] = useState<any[]>([])
  const [nicDivisions, setNicDivisions] = useState<string[]>([])
  const [nicLoading, setNicLoading] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState("")
  const [copied, setCopied] = useState("")

  async function loadDivisions() {
    if (nicDivisions.length > 0) return
    const r = await fetch("/api/ca/nic-search").then(r => r.json())
    setNicDivisions(r.divisions || [])
  }

  async function searchNIC() {
    if (!nicQuery && !selectedDivision) return
    setNicLoading(true)
    const params = new URLSearchParams()
    if (nicQuery) params.set("q", nicQuery)
    if (selectedDivision) params.set("division", selectedDivision)
    const r = await fetch(`/api/ca/nic-search?${params}`).then(r => r.json())
    setNicResults(r.results || [])
    setNicLoading(false)
  }

  async function searchGSTIN() {
    if (!gstinInput.trim()) return
    setGstinLoading(true)
    setGstinResult(null)
    const r = await fetch(`/api/ca/gstn-search?gstin=${encodeURIComponent(gstinInput.trim())}`).then(r => r.json())
    setGstinResult(r)
    setGstinLoading(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CA Tools</h1>
        <p className="text-sm text-gray-500 mt-1">GSTIN validator, NIC code search and quick reference tools</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* GSTIN Validator */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">GSTIN Validator & Lookup</h2>
            <p className="text-xs text-gray-500 mb-4">Validate any GSTIN — extract state, PAN, entity type instantly</p>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono uppercase"
                placeholder="Enter GSTIN e.g. 29AAAPL1234C1Z5"
                maxLength={15}
                value={gstinInput}
                onChange={e => setGstinInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && searchGSTIN()}
              />
              <button onClick={searchGSTIN} disabled={gstinLoading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {gstinLoading ? "..." : "Validate"}
              </button>
            </div>

            {gstinResult && (
              <div className={`mt-4 rounded-xl p-4 border ${gstinResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                {!gstinResult.valid ? (
                  <p className="text-sm text-red-700 font-medium">❌ Invalid GSTIN — {gstinResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-700 font-bold">✓ Valid GSTIN</span>
                      <code className="text-xs bg-white px-2 py-0.5 rounded border font-mono">{gstinResult.gstin}</code>
                    </div>
                    {[
                      { label: "State", value: gstinResult.state },
                      { label: "PAN", value: gstinResult.pan },
                      { label: "Entity Type", value: gstinResult.entity_type },
                      { label: "GST Status", value: gstinResult.status },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500">{row.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{row.value || "—"}</span>
                          {row.value && (
                            <button onClick={() => copy(row.value, row.label)}
                              className="text-xs text-blue-500 hover:text-blue-700">
                              {copied === row.label ? "✓" : "Copy"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-2">{gstinResult.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick GSTIN format guide */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">GSTIN Format Guide</h3>
            <div className="font-mono text-xs bg-gray-50 rounded-lg p-3 mb-3">
              <span className="bg-blue-100 text-blue-800 px-1 rounded">29</span>
              <span className="bg-green-100 text-green-800 px-1 rounded">AAAPL</span>
              <span className="bg-yellow-100 text-yellow-800 px-1 rounded">1234</span>
              <span className="bg-purple-100 text-purple-800 px-1 rounded">C</span>
              <span className="bg-red-100 text-red-800 px-1 rounded">1</span>
              <span className="bg-gray-200 text-gray-800 px-1 rounded">Z</span>
              <span className="bg-orange-100 text-orange-800 px-1 rounded">5</span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="bg-blue-100 text-blue-800 px-1 rounded font-mono">29</span> — State code (2 digits)</p>
              <p><span className="bg-green-100 text-green-800 px-1 rounded font-mono">AAAPL</span> — First 5 chars of PAN</p>
              <p><span className="bg-yellow-100 text-yellow-800 px-1 rounded font-mono">1234</span> — Next 4 digits of PAN</p>
              <p><span className="bg-purple-100 text-purple-800 px-1 rounded font-mono">C</span> — PAN entity type</p>
              <p><span className="bg-red-100 text-red-800 px-1 rounded font-mono">1</span> — Registration number</p>
              <p><span className="bg-gray-200 text-gray-800 px-1 rounded font-mono">Z</span> — Always Z</p>
              <p><span className="bg-orange-100 text-orange-800 px-1 rounded font-mono">5</span> — Check digit</p>
            </div>
          </div>
        </div>

        {/* NIC Code Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">NIC 2008 Code Search</h2>
          <p className="text-xs text-gray-500 mb-4">Search National Industrial Classification codes for GST registration and ITR filing</p>

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Search by keyword or NIC code..."
              value={nicQuery}
              onChange={e => setNicQuery(e.target.value)}
              onFocus={loadDivisions}
              onKeyDown={e => e.key === "Enter" && searchNIC()}
            />
            <button onClick={searchNIC} disabled={nicLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {nicLoading ? "..." : "Search"}
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Filter by Division</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={selectedDivision}
              onChange={e => { setSelectedDivision(e.target.value); }}
              onFocus={loadDivisions}>
              <option value="">All divisions</option>
              {nicDivisions.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <button onClick={searchNIC} className="w-full py-2 border rounded-lg text-sm hover:bg-gray-50">
            {selectedDivision ? `Show all ${selectedDivision} codes` : "Browse all codes"}
          </button>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {nicResults.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">Search for NIC codes above</p>
            )}
            {nicResults.map(r => (
              <div key={r.code}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => copy(`${r.code} - ${r.desc}`, r.code)}>
                <div className="flex items-center gap-3">
                  <code className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{r.code}</code>
                  <div>
                    <p className="text-xs text-gray-900">{r.desc}</p>
                    <p className="text-xs text-gray-400">{r.division}</p>
                  </div>
                </div>
                <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100">
                  {copied === r.code ? "✓ Copied" : "Copy"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick reference */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "State GST Codes", items: ["07 — Delhi", "27 — Maharashtra", "29 — Karnataka", "33 — Tamil Nadu", "24 — Gujarat", "09 — Uttar Pradesh", "36 — Telangana", "32 — Kerala", "19 — West Bengal", "06 — Haryana"] },
          { title: "PAN Entity Types (4th char)", items: ["P — Individual / Proprietor", "C — Company", "H — HUF", "F — Firm / LLP", "A — AOP / BOI", "T — Trust", "B — Body of Individuals", "L — Local Authority", "J — Artificial Juridical", "G — Government"] },
          { title: "Common NIC Codes", items: ["6201 — IT / Software", "6920 — CA / Accounting", "6910 — Legal Services", "7020 — Management Consulting", "4711 — Retail (General)", "5610 — Restaurant", "8531 — School / Education", "8620 — Medical Practice", "4100 — Construction", "6110 — Telecom"] },
        ].map(section => (
          <div key={section.title} className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map(item => (
                <div key={item} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2"
                  onClick={() => copy(item.split(" — ")[0], item)}>
                  <p className="text-xs text-gray-700">{item}</p>
                  <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100">{copied === item ? "✓" : "Copy"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
