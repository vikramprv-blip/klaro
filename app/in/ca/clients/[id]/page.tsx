"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import FileUpload from "@/components/file-upload"

const DOC_TYPES = ["ID", "Contract", "Invoice", "Evidence", "Other"]

export default function ClientPage() {
  const { id } = useParams()

  const [client, setClient] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")
  const [documentType, setDocumentType] = useState("Other")

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient)
    loadDocs()
  }, [id])

  async function loadDocs() {
    const res = await fetch(`/api/documents/list?client_id=${id}`)
    const data = await res.json()
    setDocs(Array.isArray(data?.documents) ? data.documents : [])
  }

  async function deleteDoc(docId: string) {
    setError("")
    const ok = window.confirm("Delete this document?")
    if (!ok) return

    const res = await fetch(`/api/documents/${docId}`, {
      method: "DELETE",
    })

    const data = await res.json()
    if (!res.ok) return setError(data.error || "Delete failed")

    loadDocs()
  }

  if (!client) return <p className="p-8 text-sm text-gray-400">Loading...</p>

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <h1 className="text-xl font-medium">{client.name}</h1>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Email: {client.email || "-"}</p>
        <p>Phone: {client.phone || "-"}</p>
      </div>

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
          form.append("client_id", id as string)
          form.append("document_type", documentType)

          const res = await fetch("/api/documents/upload", {
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
        <h2 className="text-sm font-medium text-gray-700">Documents</h2>

        {docs.length === 0 && (
          <p className="text-xs text-gray-400">No documents</p>
        )}

        {docs.map(doc => (
          <div key={doc.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <p className="text-sm">{doc.file_name || doc.title || "Untitled Document"}</p>
              <p className="text-xs text-gray-500">{doc.doc_category || "Other"}</p>
            </div>

            <div className="flex gap-3 items-center">
              <a
                href={`/in/ca/documents-ai?client_id=${id}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-xs"
              >
                View
              </a>

              <button
                onClick={() => deleteDoc(doc.id)}
                className="text-red-600 text-xs hover:underline"
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
