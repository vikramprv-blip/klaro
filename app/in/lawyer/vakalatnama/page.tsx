"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState, useRef } from "react"

export default function VakalatnanaPage() {
  const [list, setList] = useState<any[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({
    matter_id: "", client_name: "", client_address: "",
    advocate_name: "", bar_number: "", court_name: "",
    case_number: "", case_type: "Civil", opposite_party: "",
    date_signed: new Date().toISOString().split("T")[0]
  })
  const printRef = useRef<HTMLDivElement>(null)

  async function load() {
    const [vr, mr] = await Promise.all([
      fetch("/api/lawyer/vakalatnama").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ])
    setList(vr.vakalatnamas || [])
    setMatters(Array.isArray(mr) ? mr : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function prefillFromMatter(matter_id: string) {
    const m = matters.find(m => m.id === matter_id)
    if (!m) return
    setForm(f => ({
      ...f,
      matter_id,
      client_name: m.client_name || f.client_name,
      court_name: m.court || f.court_name,
      case_number: m.cnr_number || m.case_number || f.case_number,
      opposite_party: m.opposing_party || f.opposite_party,
      case_type: m.matter_type || f.case_type,
    }))
  }

  async function handleGenerate(e: any) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/lawyer/vakalatnama", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    })
    const data = await res.json()
    setSaving(false)
    if (data.id) { setSelected(data); load() }
  }

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html><head><title>Vakalatnama</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; margin: 40px; color: #000; }
        h1 { text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 20px; }
        h2 { font-size: 14px; margin: 16px 0 8px; }
        .field { margin-bottom: 8px; }
        .label { font-weight: bold; }
        .sig-row { display: flex; justify-content: space-between; margin-top: 60px; }
        .sig-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 8px; }
        @media print { button { display: none; } }
      </style></head><body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vakalatnama Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Auto-fill vakalatnama from matter details — ready to print and file</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Form */}
        <div className="col-span-2">
          <form onSubmit={handleGenerate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Generate Vakalatnama</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Link to Matter (auto-fills fields)</label>
              {/* matter_id select replaced by SearchableSelect */}
              <SearchableSelect
                options={[{value:"",label:"No matter"}, ...(matters||[]).map((m:any)=>({value:m.id,label:`${m.client_name} — ${m.matter_title||m.title||"Matter"}`,sub:m.cnr_number||m.court||""}))]}
                value={form.matter_id||""}
                onChange={val=>setForm({...form,matter_id:val})}
                placeholder="Search matter or client..."
              />
            </div>
            {[
              { key: "client_name", label: "Client Name *", required: true },
              { key: "client_address", label: "Client Address" },
              { key: "advocate_name", label: "Advocate Name *", required: true },
              { key: "bar_number", label: "Bar Council Reg. No." },
              { key: "court_name", label: "Court Name *", required: true },
              { key: "case_number", label: "Case / CNR Number" },
              { key: "opposite_party", label: "Opposite Party" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                <input required={f.required} className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Case Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.case_type} onChange={e => setForm({ ...form, case_type: e.target.value })}>
                  {["Civil", "Criminal", "Family", "Consumer", "Arbitration", "RERA", "IBC", "NCLT", "High Court Writ", "Supreme Court", "Other"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.date_signed} onChange={e => setForm({ ...form, date_signed: e.target.value })} />
              </div>
            </div>
            <button disabled={saving} className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
              {saving ? "Generating..." : "Generate Vakalatnama"}
            </button>
          </form>
        </div>

        {/* Preview + List */}
        <div className="col-span-3 space-y-4">
          {selected && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium">🖨 Print / Download</button>
                  <button onClick={() => setSelected(null)} className="px-3 py-1.5 border rounded-lg text-xs">Close</button>
                </div>
              </div>
              <div ref={printRef} className="border rounded-lg p-6 text-sm font-serif space-y-4 bg-white">
                <h1 className="text-center text-base font-bold underline">VAKALATNAMA</h1>
                <p className="text-center text-xs text-gray-500">(To be filed before the Honourable Court)</p>

                <div className="space-y-2 text-sm">
                  <p>I/We, <strong>{selected.client_name}</strong>{selected.client_address ? `, residing at ${selected.client_address}` : ""}, do hereby appoint, retain and authorise:</p>

                  <p className="mt-2"><strong>{selected.advocate_name}</strong>{selected.bar_number ? ` (Bar Council Reg. No. ${selected.bar_number})` : ""}, Advocate, to appear, act and plead on my/our behalf in:</p>

                  <div className="bg-gray-50 rounded p-3 space-y-1 text-xs">
                    <p><span className="font-semibold">Court:</span> {selected.court_name}</p>
                    {selected.case_number && <p><span className="font-semibold">Case No.:</span> {selected.case_number}</p>}
                    {selected.case_type && <p><span className="font-semibold">Nature of Case:</span> {selected.case_type}</p>}
                    {selected.opposite_party && <p><span className="font-semibold">Opposite Party:</span> {selected.opposite_party}</p>}
                  </div>

                  <p className="mt-2 text-xs">And in all proceedings connected therewith, and to do all acts, deeds and things necessary and expedient in connection with the said case. I/We agree to ratify all acts done by the said Advocate in pursuance of this authority.</p>

                  <p className="text-xs mt-2">I/We agree to pay the Advocate's fees as agreed upon. This Vakalatnama shall remain in force until revoked in writing.</p>

                  <div className="flex justify-between mt-8 pt-4">
                    <div className="text-center">
                      <div className="border-t border-gray-800 pt-2 w-40">
                        <p className="text-xs font-semibold">{selected.client_name}</p>
                        <p className="text-xs text-gray-500">Client Signature</p>
                        <p className="text-xs text-gray-500">Date: {selected.date_signed}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-800 pt-2 w-40">
                        <p className="text-xs font-semibold">{selected.advocate_name}</p>
                        <p className="text-xs text-gray-500">Advocate Signature</p>
                        <p className="text-xs text-gray-500">Date: {selected.date_signed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Generated Vakalatnamas ({list.length})</h2>
            </div>
            {list.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No vakalatnamas yet</p>}
            {list.map(v => (
              <div key={v.id} onClick={() => setSelected(v)}
                className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${selected?.id === v.id ? "bg-blue-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.client_name}</p>
                    <p className="text-xs text-gray-500">{v.court_name} · {v.case_type} · {v.date_signed}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "signed" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
