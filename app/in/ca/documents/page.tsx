"use client"
import { useEffect, useState } from "react"
import FileUpload from "@/components/file-upload"

export default function DocumentsPage() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState("")
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState("")

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.json())
      .then(setClients)
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-medium text-gray-900">Documents</h1>

      <select
        value={clientId}
        onChange={e => setClientId(e.target.value)}
        className="border px-3 py-2 rounded mb-4 w-full text-sm"
      >
        <option value="">Select client</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <FileUpload
        onTextExtracted={async (t, name) => {
          setError("")
          setSaved("")
          setText(t)
          setFilename(name)

          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: name,
              content: t,
              clientId
            }),
          })

          const data = await res.json()
          if (!res.ok) {
            setError(data.error)
            return
          }

          setSaved(data.document?.id)
        }}
      />

      {saved && <p className="text-green-600 mt-2 text-xs">Saved ({saved})</p>}
      {error && <p className="text-red-600 mt-2 text-xs">{error}</p>}
    </div>
  )
}
