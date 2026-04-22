"use client"
import { useEffect, useState } from "react"
import FileUpload from "@/components/file-upload"

const DOC_TYPES = ["ID", "Contract", "Invoice", "Evidence", "Other"]

export default function DocumentsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState("")
  const [documentType, setDocumentType] = useState("Other")
  const [typeFilter, setTypeFilter] = useState("")
  const [q, setQ] = useState("")
  const [docs, setDocs] = useState<any[]>([])
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/clients")
      .then(async (r) => {
        const text = await r.text()
        return text ? JSON.parse(text) : []
      })
      .then(data => Array.isArray(data) ? data : (Array.isArray(data.clients) ? data.clients : []))
      .catch((e) => setError(e.message || "Failed to load clients"))
  }, [])

  useEffect(() => {
    loadDocs()
  }, [clientId, q, typeFilter])

  async function loadDocs() {
    setError("")

    const params = new URLSearchParams()
    if (clientId) params.set("clientId", clientId)
    if (typeFilter) params.set("documentType", typeFilter)
    if (q.trim()) params.set("q", q.trim())

    const url = params.toString()
      ? `/api/documents/list?${params.toString()}`
      : "/api/documents/list"

    const res = await fetch(url)
    let data: any = []
    try {
      const text = await res.text()
      data = text ? JSON.parse(text) : []
    } catch (e) {
      console.error("Invalid JSON:", e)
      setDocs([])
      return setError("Invalid server response")
    }

    if (!res.ok) {
      setDocs([])
      return setError(data.error || "Failed to load documents")
    }

    setDocs(Array.isArray(data) ? data : [])
  }

  async function deleteDoc(id: string) {
    setError("")
    const ok = window.confirm("Delete this document?")
    if (!ok) return

    const res = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : {}

    if (!res.ok) return setError(data.error || "Delete failed")

    loadDocs()
  }

  async function renameDoc(id: string, current: string) {
    setError("")
    const name = window.prompt("Rename file", current)
    if (!name) return

    const res = await fetch("/api/documents/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, filename: name }),
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : {}

    if (!res.ok) return setError(data.error || "Rename failed")

    loadDocs()
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <h1 className="text-xl font-medium text-gray-900">Documents</h1>

      <select
        value={clientId}
        onChange={e => setClientId(e.target.value)}
        className="border px-3 py-2 rounded w-full text-sm"
      >
        <option value="">All Clients</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={typeFilter}
        onChange={e => setTypeFilter(e.target.value)}
        className="border px-3 py-2 rounded w-full text-sm"
      >
        <option value="">All Types</option>
        {DOC_TYPES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search filename or extracted text"
        className="border px-3 py-2 rounded w-full text-sm"
      />

      <select
        value={documentType}
        onChange={e => setDocumentType(e.target.value)}
        className="border px-3 py-2 rounded w-full text-sm"
      >
        {DOC_TYPES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <FileUpload
        onTextExtracted={async (_t: string, name: string, file: File) => {
          setError("")
          setSaved("")

          const form = new FormData()
          form.append("file", file)
          form.append("clientId", clientId)
          form.append("documentType", documentType)
          form.append("content", _t || "")

          const res = await fetch("/api/documents", {
            method: "POST",
            body: form,
          })

          const text = await res.text()
          const data = text ? JSON.parse(text) : {}

          if (!res.ok) return setError(data.error || "Upload failed")

          setSaved(data.document.id)
          loadDocs()
        }}
      />

      {saved && <p className="text-green-600 text-xs">Saved ({saved})</p>}
      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-medium text-gray-700">Uploaded Documents</h2>

        {docs.length === 0 && (
          <p className="text-xs text-gray-400">No documents yet</p>
        )}

        {docs.map(doc => (
          <div key={doc.id} className="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800">{doc.filename}</p>
              <p className="text-xs text-gray-500">{doc.documentType || "Other"}</p>
              <p className="text-xs text-gray-400">
                {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 text-xs items-center">
              <a
                href={`/in/ca/documents/${doc.id}`}
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

              <button
                onClick={() => renameDoc(doc.id, doc.filename)}
                className="text-gray-600 hover:underline"
              >
                Rename
              </button>

              <button
                onClick={() => deleteDoc(doc.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
