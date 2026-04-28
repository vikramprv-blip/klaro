"use client"
import SearchableSelect from "@/components/SearchableSelect"
import { useEffect, useState } from "react"
import FileUpload from "@/components/file-upload"

export default function LegalDocumentsPage() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState("")
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")
  const [matters, setMatters] = useState<any[]>([])
  const [matterId, setMatterId] = useState("")

  useEffect(() => {
    fetch("/api/lawyer/matters")
      .then(r => r.json())
      .then(setMatters)
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-medium text-gray-900">Documents</h1>

      <select
        value={matterId}
        onChange={e => setMatterId(e.target.value)}
        className="border px-3 py-2 rounded mb-4 w-full text-sm"
      >
        <option value="">Select matter</option>
        {matters.map(m => (
          <option key={m.id} value={m.id}>
            {m.client_name} — {m.matter_title}
          </option>
        ))}
      </select>

      <FileUpload
        onTextExtracted={async (t: string, name: string) => {
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
              clientId: matterId
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
