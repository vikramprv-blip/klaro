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
  const [usage, setUsage] = useState<any>(null)

  const loadDocuments = async () => {
    const res = await fetch(`/api/us/documents/list?firm_id=${firmId}`)
    const data = await res.json()
    setDocuments(data.documents || [])
    setLoading(false)
  }

  const loadUsage = async () => {
    const res = await fetch("/api/us/billing/usage")
    const data = await res.json()
    setUsage(data)
  }

  const refreshVault = async () => {
    await loadDocuments()
    await loadUsage()
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
      refreshVault()
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

    await refreshVault()
  }

  const deleteFile = async (id: string, file_path: string) => {
    const ok = window.confirm("Delete this document?")
    if (!ok) return

    await fetch("/api/us/documents/delete", {
      method: "POST",
      body: JSON.stringify({ id, file_path, firm_id: firmId }),
    })

    await refreshVault()
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
  <h2 className="text-xl font-semibold">Document Vault</h2>
  {usage && (
    <>
      <div className="mt-2 text-sm">
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-black rounded"
            style={{ width: `${usage.percent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {(usage.used / (1024*1024)).toFixed(1)} MB of {(usage.limit / (1024*1024)).toFixed(0)} MB used
        </p>
      </div>

      {usage.percent > 80 && (
        <div className="mt-3 p-3 border rounded text-sm">
          Storage almost full. 
          <a href="/pricing" className="underline ml-1">Upgrade plan</a>
        </div>
      )}
    </>
  )}
</div>
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
