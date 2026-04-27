"use client"

import { useState } from "react"

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("firm_id", "demo-firm-id")
    formData.append("profession", "lawyer")

    const res = await fetch("/api/us/documents/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log(data)

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Document title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="border px-4 py-2"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  )
}
