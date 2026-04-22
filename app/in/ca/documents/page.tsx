"use client"
import { useEffect, useState } from "react"
import FileUpload from "@/components/file-upload"

export default function DocumentsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState("")
  const [docs, setDocs] = useState<any[]>([])
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
    loadDocs()
  }, [])

  async function loadDocs() {
    const res = await fetch("/api/documents/list")
    const data = await res.json()
    setDocs(data)
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <h1 className="text-xl font-medium text-gray-900">Documents</h1>

      <select
        value={clientId}
        onChange={e => setClientId(e.target.value)}
        className="border px-3 py-2 rounded w-full text-sm"
      >
        <option value="">Select client</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <FileUpload
        onTextExtracted={async (_t: string, name: string, file: File) => {
          setError("")
          setSaved("")

          const form = new FormData()
          form.append("file", file)
          form.append("clientId", clientId)

          const res = await fetch("/api/documents", {
            method: "POST",
            body: form,
          })

          const data = await res.json()
          if (!res.ok) return setError(data.error)

          setSaved(data.document.id)
          loadDocs()
        }}
      />

      {saved && <p className="text-green-600 text-xs">Saved ({saved})</p>}
      {error && <p className="text-red-600 text-xs">{error}</p>}

      {/* DOCUMENT LIST */}
      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-medium text-gray-700">Uploaded Documents</h2>

        {docs.length === 0 && (
          <p className="text-xs text-gray-400">No documents yet</p>
        )}

        {docs.map(doc => (
          <div key={doc.id} className="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800">{doc.filename}</p>
              <p className="text-xs text-gray-400">
                {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 text-xs">
              <a
                href={doc.fileUrl}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Preview
              </a>

              <a
                href={doc.fileUrl}
                download
                className="text-gray-600 hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
