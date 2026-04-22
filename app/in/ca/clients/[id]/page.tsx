"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import FileUpload from "@/components/file-upload"

export default function ClientPage() {
  const { id } = useParams()

  const [client, setClient] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient)
    fetch(`/api/documents/list?clientId=${id}`).then(r => r.json()).then(setDocs)
  }, [id])

  async function loadDocs() {
    const res = await fetch(`/api/documents/list?clientId=${id}`)
    const data = await res.json()
    setDocs(data)
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

      <FileUpload
        onTextExtracted={async (_t: string, name: string, file: File) => {
          setError("")
          setSaved("")

          const form = new FormData()
          form.append("file", file)
          form.append("clientId", id as string)

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
        <h2 className="text-sm font-medium text-gray-700">Documents</h2>

        {docs.length === 0 && (
          <p className="text-xs text-gray-400">No documents</p>
        )}

        {docs.map(doc => (
          <div key={doc.id} className="border rounded p-3 flex justify-between items-center">
            <span className="text-sm">{doc.filename}</span>

            <div className="flex gap-3 items-center">
              <a
                href={doc.fileUrl}
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
