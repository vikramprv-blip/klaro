"use client"
import { useState } from "react"
import FileUpload from "@/components/file-upload"

export default function DocumentsPage() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState("")
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-medium text-gray-900">Documents</h1>
      <p className="text-sm text-gray-400 mt-1 mb-6">
        Upload client documents (PDF, Excel, CSV)
      </p>

      <FileUpload
        onTextExtracted={async (t, name) => {
          setError("")
          setSaved("")
          setText(t)
          setFilename(name)

          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: name, content: t }),
          })

          const data = await res.json()
          if (!res.ok) {
            setError(data.error || "Failed to save document")
            return
          }

          setSaved(data.document?.id || "saved")
        }}
      />

      {saved && (
        <p className="mt-4 text-xs text-green-700">
          Saved document: {filename} ({saved})
        </p>
      )}

      {error && (
        <p className="mt-4 text-xs text-red-600">
          {error}
        </p>
      )}

      {text && (
        <div className="mt-6 border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">
            Extracted from {filename} ({text.length} chars)
          </p>
          <div className="text-xs text-gray-600 whitespace-pre-wrap max-h-64 overflow-auto">
            {text.slice(0, 3000)}
          </div>
        </div>
      )}
    </div>
  )
}
