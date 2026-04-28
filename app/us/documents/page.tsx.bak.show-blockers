"use client"

import { useEffect, useState } from "react"
import { UsBillingCard } from "@/app/us/components/us-billing-card"

type DocumentRow = {
  id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

function formatSize(bytes?: number | null) {
  if (!bytes) return "0 MB"
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default function UsDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  async function loadDocuments() {
    setLoading(true)
    const res = await fetch("/api/us/documents/list", { cache: "no-store" })
    const json = await res.json()
    setDocuments(json.documents || [])
    setLoading(false)
  }

  async function upload(file: File) {
    setUploading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/us/documents/upload", {
      method: "POST",
      body: formData,
    })

    const json = await res.json()

    if (!res.ok) {
      setMessage(json.error || "Upload failed")
      setUploading(false)
      return
    }

    setMessage("Uploaded successfully")
    await loadDocuments()
    setUploading(false)
  }

  async function deleteDocument(documentId: string) {
    const res = await fetch("/api/us/documents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    })

    const json = await res.json()

    if (!res.ok) {
      setMessage(json.error || "Delete failed")
      return
    }

    setMessage("Document deleted")
    await loadDocuments()
  }

  async function shareDocument(documentId: string) {
    setMessage("")

    const res = await fetch("/api/us/client-portal/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId }),
    })

    const json = await res.json()

    if (!res.ok) {
      setMessage(json.error || "Could not create share link")
      return
    }

    const link = json.url || json.share_url || json.link
    if (link) {
      await navigator.clipboard.writeText(link)
      setMessage("Client portal link copied")
    } else {
      setMessage("Share link created")
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Klaro US</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Document Vault
          </h1>
          <p className="mt-2 text-slate-600">
            Upload, manage, and share documents with clients.
          </p>
        </div>

        <UsBillingCard />

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Upload document</h2>
              <p className="text-sm text-slate-500">
                Storage limits and billing status are enforced automatically.
              </p>
            </div>

            <label className="cursor-pointer rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              {uploading ? "Uploading..." : "Choose file"}
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) upload(file)
                  e.currentTarget.value = ""
                }}
              />
            </label>
          </div>

          {message && (
            <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold text-slate-950">Documents</h2>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-900">No documents yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Upload your first document to start using the US client portal.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Uploaded</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{doc.file_name}</div>
                      <div className="text-xs text-slate-500">{doc.mime_type || "document"}</div>
                    </td>
                    <td className="p-3">{formatSize(doc.file_size)}</td>
                    <td className="p-3">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => shareDocument(doc.id)}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
