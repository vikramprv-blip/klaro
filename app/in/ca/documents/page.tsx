"use client"
import { useEffect, useState } from "react"
import FileUpload from "@/components/file-upload"

export default function DocumentsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState("")
  const [q, setQ] = useState("")
  const [docs, setDocs] = useState<any[]>([])
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients)
  }, [])

  useEffect(() => {
    loadDocs()
  }, [clientId, q])

  async function loadDocs() {
    const params = new URLSearchParams()
    if (clientId) params.set("clientId", clientId)
    if (q.trim()) params.set("q", q.trim())

    const url = params.toString()
      ? `/api/documents/list?${params.toString()}`
      : "/api/documents/list"

    const res = await fetch(url)
    const data = await res.json()
    setDocs(data)
  }

  async function deleteDoc(id: string) {
    setError("")
    const ok = window.confirm("Delete this document?")
    if (!ok) return

    const res = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    })

    const data = await res.json()
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

    const data = await res.json()
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

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search documents by filename"
        className="border px-3 py-2 rounded w-full text-sm"
      />

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

            <div className="flex gap-3 text-xs items-center">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
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
