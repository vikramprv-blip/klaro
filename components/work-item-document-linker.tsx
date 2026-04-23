"use client"

import { useEffect, useMemo, useState } from "react"

type AvailableDocument = {
  id: string
  title?: string | null
  file_name?: string | null
  fileName?: string | null
  notes?: string | null
}

type LinkedDocument = {
  linkId?: string
  documentId: string
  title?: string | null
  file_name?: string | null
  fileName?: string | null
  notes?: string | null
}

export default function WorkItemDocumentLinker({
  workItemId,
  clientId,
}: {
  workItemId: string
  clientId?: string | null
}) {
  const [availableDocs, setAvailableDocs] = useState<AvailableDocument[]>([])
  const [linkedDocs, setLinkedDocs] = useState<LinkedDocument[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function loadAll() {
    setLoading(true)
    setMessage("")

    try {
      const listUrl = clientId
        ? `/api/documents/list?client_id=${encodeURIComponent(clientId)}`
        : "/api/documents/list"

      const [availableRes, linkedRes] = await Promise.all([
        fetch(listUrl, { cache: "no-store" }),
        fetch(`/api/work-items/${workItemId}/documents`, { cache: "no-store" }),
      ])

      const availableJson = availableRes.ok ? await availableRes.json() : {}
      const linkedJson = linkedRes.ok ? await linkedRes.json() : {}

      const available = Array.isArray(availableJson)
        ? availableJson
        : Array.isArray(availableJson.documents)
        ? availableJson.documents
        : Array.isArray(availableJson.items)
        ? availableJson.items
        : []

      const linked = Array.isArray(linkedJson.documents) ? linkedJson.documents : []

      setAvailableDocs(available)
      setLinkedDocs(linked)
    } catch {
      setMessage("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [workItemId, clientId])

  const linkedIds = useMemo(
    () => new Set(linkedDocs.map((doc) => String(doc.documentId))),
    [linkedDocs]
  )

  const selectableDocs = useMemo(
    () => availableDocs.filter((doc) => !linkedIds.has(String(doc.id))),
    [availableDocs, linkedIds]
  )

  async function linkSelected() {
    if (!selectedId || busy) return

    setBusy(true)
    setMessage("")

    try {
      const res = await fetch(`/api/work-items/${workItemId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to link document")
      }

      setSelectedId("")
      setMessage("Document linked")
      await loadAll()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to link document")
    } finally {
      setBusy(false)
    }
  }

  async function unlinkDocument(documentId: string) {
    if (!documentId || busy) return

    setBusy(true)
    setMessage("")

    try {
      const res = await fetch(`/api/work-items/${workItemId}/documents/${encodeURIComponent(documentId)}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to unlink document")
      }

      setMessage("Document unlinked")
      await loadAll()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to unlink document")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold">Manage linked documents</h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading || busy}
          >
            <option value="">
              {loading ? "Loading documents..." : selectableDocs.length ? "Select a document to link" : "No more documents available"}
            </option>
            {selectableDocs.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title || doc.file_name || doc.fileName || doc.id}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={linkSelected}
            disabled={!selectedId || loading || busy}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Link document"}
          </button>
        </div>

        {message ? (
          <div className="text-sm text-gray-600">{message}</div>
        ) : null}

        <div className="space-y-2">
          {linkedDocs.length === 0 ? (
            <div className="text-sm text-gray-500">No linked documents yet.</div>
          ) : (
            linkedDocs.map((doc) => (
              <div
                key={doc.linkId || doc.documentId}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {doc.title || doc.file_name || doc.fileName || doc.documentId}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {doc.file_name || doc.fileName || doc.documentId}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void unlinkDocument(doc.documentId)}
                  disabled={busy}
                  className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                >
                  Unlink
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
