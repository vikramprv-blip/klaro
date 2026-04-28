"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState, useRef } from "react"

type EvidenceFile = {
  id: string
  file_name: string
  sha256_hash: string
  file_size: number
  mime_type: string
  verified: boolean
  certificate_url: string | null
  created_at: string
  matter_id: string
  legal_matters?: { matter_title: string; client_name: string; cnr_number: string }
}

export default function EvidencePage() {
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedMatter, setSelectedMatter] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const [ef, m] = await Promise.all([
      fetch("/api/lawyer/evidence").then(r => r.json()),
      fetch("/api/lawyer/matters").then(r => r.json()),
    ])
    setFiles(Array.isArray(ef) ? ef : [])
    setMatters(Array.isArray(m) ? m : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleUpload(e: any) {
    const file = e.target.files?.[0]
    if (!file || !selectedMatter) { alert("Select a matter first"); return }
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    form.append("matter_id", selectedMatter)
    form.append("firm_id", "00000000-0000-0000-0000-000000000001")
    const res = await fetch("/api/lawyer/evidence", { method: "POST", body: form })
    setUploading(false)
    if (res.ok) { load(); if (fileRef.current) fileRef.current.value = "" }
    else { const d = await res.json(); alert(d.error || "Upload failed") }
  }

  async function handleVerify(id: string) {
    const res = await fetch("/api/lawyer/evidence/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidenceId: id })
    })
    if (res.ok) load()
  }

  async function handleCertificate(id: string) {
    setGenerating(id)
    const res = await fetch("/api/lawyer/evidence/certificate?id=" + id)
    setGenerating(null)
    if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `65B-certificate-${id}.pdf`
      a.click()
    } else {
      const d = await res.json()
      if (d.certificate_url) window.open(d.certificate_url, "_blank")
    }
  }

  function fmtSize(bytes: number) {
    if (!bytes) return "—"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / 1048576).toFixed(1) + " MB"
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evidence Vault</h1>
        <p className="text-sm text-gray-500 mt-1">Upload, hash, verify and generate Section 65B certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length },
          { label: "Verified", value: files.filter(f => f.verified).length },
          { label: "Certificates Generated", value: files.filter(f => f.certificate_url).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Upload Evidence</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Matter</label>
            <select
              className="border rounded-lg px-3 py-2 text-sm w-64"
              value={selectedMatter}
              onChange={e => setSelectedMatter(e.target.value)}
            >
              <option value="">Select matter</option>
              {matters.map(m => (
                <option key={m.id} value={m.id}>
                  {m.client_name} — {m.matter_title || m.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">File</label>
            <input
              ref={fileRef}
              type="file"
              onChange={handleUpload}
              disabled={uploading || !selectedMatter}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {uploading && <span className="text-sm text-gray-500 animate-pulse">Uploading & hashing...</span>}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Evidence Files</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {["File", "Matter / Client", "Size", "SHA-256 Hash", "Verified", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No evidence files yet — upload one above</td></tr>
              )}
              {files.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 max-w-48 truncate">{f.file_name}</p>
                    <p className="text-xs text-gray-400">{f.mime_type || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{f.legal_matters?.client_name || "—"}</p>
                    <p className="text-xs text-gray-500 max-w-40 truncate">{f.legal_matters?.matter_title || "—"}</p>
                    {f.legal_matters?.cnr_number && (
                      <p className="text-xs text-gray-400">{f.legal_matters.cnr_number}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmtSize(f.file_size)}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block max-w-48 truncate">
                      {f.sha256_hash}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {f.verified
                      ? <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">✓ Verified</span>
                      : <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">Unverified</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {!f.verified && (
                        <button
                          onClick={() => handleVerify(f.id)}
                          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleCertificate(f.id)}
                        disabled={generating === f.id}
                        className="px-2 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                      >
                        {generating === f.id ? "Generating..." : "📄 65B Cert"}
                      </button>
                      {f.certificate_url && (
                        <a
                          href={f.certificate_url}
                          target="_blank"
                          className="px-2 py-1 border border-green-300 text-green-700 rounded text-xs hover:bg-green-50"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
