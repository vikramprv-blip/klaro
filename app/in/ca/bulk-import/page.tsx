"use client"
import { useState, useRef } from "react"

type ImportResult = { imported: number; failed: number; errors: string[] }
type Tab = "clients" | "employees" | "documents"

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "clients",   label: "Clients",   icon: "◉" },
  { key: "employees", label: "Employees", icon: "👤" },
  { key: "documents", label: "Documents", icon: "📄" },
]

const CLIENT_TEMPLATE = `name,email,phone,gstin,address
ABC Pvt Ltd,abc@example.com,9876543210,27AABCU9603R1ZX,"123 MG Road Mumbai"
XYZ Traders,xyz@example.com,9123456789,,`

const EMPLOYEE_TEMPLATE = `name,email,phone,role,department,salary
Rahul Sharma,rahul@example.com,9876543210,Senior CA,Audit,75000
Priya Mehta,priya@example.com,9123456789,Tax Associate,GST,45000`

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
  return lines.slice(1).map(line => {
    const values = line.split(",")
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] || "").trim().replace(/^"|"$/g, "") })
    return row
  })
}

function downloadTemplate(content: string, filename: string) {
  const a = document.createElement("a")
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content)
  a.download = filename
  a.click()
}

export default function BulkImportPage() {
  const [tab, setTab] = useState<Tab>("clients")
  const [csvText, setCsvText] = useState("")
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [clientId, setClientId] = useState("")
  const [clientName, setClientName] = useState("")
  const [docCategory, setDocCategory] = useState("General")
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  function handleCSVFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setCsvText(text)
      setPreview(parseCSV(text).slice(0, 5))
    }
    reader.readAsText(file)
  }

  function handleDocFiles(newFiles: File[]) {
    const allowed = ["application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword","image/jpeg","image/png","image/jpg"]
    const valid = newFiles.filter(f => allowed.includes(f.type))
    const invalid = newFiles.filter(f => !allowed.includes(f.type))
    if (invalid.length) alert(`Skipped ${invalid.length} unsupported file(s)`)
    setFiles(prev => [...prev, ...valid])
  }

  function switchTab(t: Tab) {
    setTab(t); setResult(null); setCsvText(""); setPreview([]); setFiles([])
  }

  async function runImport() {
    setLoading(true); setResult(null)
    try {
      if (tab === "clients" || tab === "employees") {
        const rows = parseCSV(csvText)
        if (!rows.length) { alert("No valid rows found"); setLoading(false); return }
        const res = await fetch(`/api/bulk-import/${tab}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows, orgId: "demo-org" }),
        })
        setResult(await res.json())
      } else {
        if (!files.length) { alert("No files selected"); setLoading(false); return }
        const formData = new FormData()
        formData.append("clientId", clientId)
        formData.append("clientName", clientName)
        formData.append("category", docCategory)
        files.forEach(f => formData.append("files", f))
        const res = await fetch("/api/bulk-import/documents", { method: "POST", body: formData })
        setResult(await res.json())
      }
    } catch (e: any) {
      setResult({ imported: 0, failed: 1, errors: [e.message] })
    }
    setLoading(false)
  }

  const allRows = parseCSV(csvText)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bulk Import</h1>
        <p className="text-sm text-gray-500 mt-1">Import clients & employees from CSV · Upload multiple documents at once</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {TABS.map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {(tab === "clients" || tab === "employees") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Required columns: {tab === "clients"
                ? "name · email · phone · gstin · address"
                : "name · email · phone · role · department · salary"}
            </p>
            <button onClick={() => downloadTemplate(
              tab === "clients" ? CLIENT_TEMPLATE : EMPLOYEE_TEMPLATE,
              `${tab}_template.csv`
            )} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-gray-600">
              ⬇ Download Template
            </button>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleCSVFile(f) }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
            }`}>
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm text-gray-600">Drop CSV file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">.csv files supported</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleCSVFile(e.target.files[0]) }} />
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Or paste CSV content:</p>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm font-mono h-28 resize-none"
              placeholder={`name,email,phone\nABC Pvt Ltd,abc@example.com,9876543210`}
              value={csvText}
              onChange={e => { setCsvText(e.target.value); setPreview(parseCSV(e.target.value).slice(0, 5)) }} />
          </div>

          {preview.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600">Preview — first 5 rows</p>
                <p className="text-xs text-gray-400">{allRows.length} total rows detected</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(preview[0]).map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700">{v || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Client Name (optional)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ABC Pvt Ltd"
                value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Client ID (optional)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="UUID"
                value={clientId} onChange={e => setClientId(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={docCategory} onChange={e => setDocCategory(e.target.value)}>
                {["General","GST","TDS","ITR","Audit","Legal","HR","Invoice","Other"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleDocFiles(Array.from(e.dataTransfer.files)) }}
            onClick={() => docRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
            }`}>
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm text-gray-600">Drop files here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF · DOCX · JPG · PNG — multiple files allowed</p>
            <input ref={docRef} type="file" multiple accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => { if (e.target.files) handleDocFiles(Array.from(e.target.files)) }} />
          </div>

          {files.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600">{files.length} file(s) ready</p>
                <button onClick={() => setFiles([])} className="text-xs text-red-500">Clear all</button>
              </div>
              <div className="divide-y max-h-48 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{f.type === "application/pdf" ? "📄" : f.type.includes("word") ? "📝" : "🖼️"}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{f.name}</p>
                        <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-500 text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={runImport}
          disabled={loading || (tab !== "documents" ? !csvText.trim() : !files.length)}
          className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-40">
          {loading ? "Importing…" : `Import ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
        </button>
        {result && (
          <p className="text-sm text-gray-500">
            ✅ {result.imported} imported · ❌ {result.failed} failed
          </p>
        )}
      </div>

      {result && (
        <div className={`mt-4 rounded-xl border p-4 ${result.failed > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
          <p className="text-sm font-medium">
            {result.imported > 0 ? `✅ ${result.imported} imported successfully` : ""}
            {result.failed > 0 ? ` · ⚠️ ${result.failed} failed` : ""}
          </p>
          {result.errors.length > 0 && (
            <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 font-mono">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
