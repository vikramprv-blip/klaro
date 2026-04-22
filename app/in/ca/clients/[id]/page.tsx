"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function ClientPage() {
  const { id } = useParams()

  const [client, setClient] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient)
    fetch(`/api/documents/list?clientId=${id}`).then(r => r.json()).then(setDocs)
  }, [id])

  if (!client) return <p className="p-8 text-sm text-gray-400">Loading...</p>

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <h1 className="text-xl font-medium">{client.name}</h1>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Email: {client.email || "-"}</p>
        <p>Phone: {client.phone || "-"}</p>
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-medium text-gray-700">Documents</h2>

        {docs.length === 0 && (
          <p className="text-xs text-gray-400">No documents</p>
        )}

        {docs.map(doc => (
          <div key={doc.id} className="border rounded p-3 flex justify-between">
            <span className="text-sm">{doc.filename}</span>

            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-xs"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
