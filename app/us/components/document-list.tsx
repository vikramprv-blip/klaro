"use client"

import { getUser } from "@/app/lib/auth/get-user"
import { getFirmIdFromUser } from "@/app/lib/auth/get-firm"
import { useEffect, useState } from "react"

type DocumentItem = {
  id: string
  title: string
  file_path: string
  file_type: string | null
  file_size: number | null
  created_at: string
}

export default function DocumentList() {
  const [firmId, setFirmId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  const loadDocuments = async () => {
    const res = await fetch(`/api/us/documents/list?firm_id=${firmId}`)
    const data = await res.json()
    setDocuments(data.documents || [])
    setLoading(false)
  }

  const searchDocuments = async (value: string) => {
    setQuery(value)
    setLoading(true)

    const res = await fetch(`/api/us/documents/search?firm_id=${firmId}`, {
      method: "POST",
      body: JSON.stringify({ query: value }),
    })

    const data = await res.json()
    setDocuments(data.documents || [])
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const user = await getUser()
      const id = getFirmIdFromUser(user)
      setFirmId(id)
    }
    init()
  }, [])

  useEffect(() => {
    if (firmId) {
      loadDocuments()
    }
  }, [firmId])

  const openFile = async (id: string, file_path: string) => {
    const res = await fetch("/api/us/documents/view", {
      method: "POST",
      body: JSON.stringify({ id, file_path, firm_id: firmId }),
    })

    const data = await res.json()
    if (data.url) window.open(data.url, "_blank")
  }

  const downloadFile = async (id: string, file_path: string) => {
    const res = await fetch("/api/us/documents/download", {
      method: "POST",
      body: JSON.stringify({ id, file_path, firm_id: firmId }),
    })

    const data = await res.json()
    if (data.url) window.open(data.url, "_blank")
  }

  const renameFile = async (id: string, currentTitle: string) => {
    const title = window.prompt("New document title", currentTitle)
    if (!title) return

    await fetch("/api/us/documents/rename", {
      method: "POST",
      body: JSON.stringify({ id, title, firm_id: firmId }),
    })

    await loadDocuments()
  }

  const deleteFile = async (id: string, file_path: string) => {
    const ok = window.confirm("Delete this document?")
    if (!ok) return

    await fetch("/api/us/documents/delete", {
      method: "POST",
      body: JSON.stringify({ id, file_path, firm_id: firmId }),
    })

    await loadDocuments()
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Document Vault</h2>
        <input
          value={query}
          onChange={(e) => searchDocuments(e.target.value)}
          placeholder="Search documents..."
          className="w-64 rounded-xl border p-2 text-sm"
        />
      </div>

      {loading && <p className="text-sm">Loading...</p>}

      {!loading && documents.length === 0 && (
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      )}

      {!loading && documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border p-3 flex justify-between items-center gap-4">
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.file_type || "Unknown"} • {doc.file_size || 0} bytes
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <button onClick={() => openFile(doc.id, doc.file_path)} className="underline">
                  View
                </button>
                <button onClick={() => downloadFile(doc.id, doc.file_path)} className="underline">
                  Download
                </button>
                <button onClick={() => renameFile(doc.id, doc.title)} className="underline">
                  Rename
                </button>
                <button onClick={() => deleteFile(doc.id, doc.file_path)} className="underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
