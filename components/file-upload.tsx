"use client"
import { useRef, useState } from "react"

type Props = {
  onTextExtracted: (text: string, name: string, file: File) => Promise<void> | void
  accept?: string
  label?: string
  hint?: string
}

export default function FileUpload({
  onTextExtracted,
  accept,
  label,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filename, setFilename] = useState("")
  const [filesize, setFilesize] = useState("")
  const [status, setStatus] = useState("")

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleFile(file: File) {
    try {
      setUploading(true)
      setStatus("Extracting text...")
      setFilename(file.name)
      setFilesize(formatBytes(file.size))

      let text = ""

      try {
        const form = new FormData()
        form.append("file", file)

        const res = await fetch("/api/ca/ai/extract-text", {
          method: "POST",
          body: form,
        })

        const raw = await res.text()
        const data = raw ? JSON.parse(raw) : {}

        if (res.ok) {
          text = data.text || ""
          setStatus("Saving document...")
        } else {
          setStatus(data.error || "Text extraction failed, saving file only...")
        }
      } catch {
        setStatus("Text extraction unavailable, saving file only...")
      }

      await onTextExtracted(text, file.name, file)
      setStatus("Upload complete")
    } catch (e: any) {
      setStatus(e?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) await handleFile(file)
          if (inputRef.current) inputRef.current.value = ""
        }}
      />

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!uploading) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file && !uploading) await handleFile(file)
        }}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
          dragging ? "border-blue-400 bg-blue-50" : "border-gray-300"
        } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <p className="text-sm text-gray-700">
          {uploading ? "Uploading..." : label || "Drop file or click"}
        </p>
        {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
      </div>

      {filename && (
        <div className="text-xs text-gray-600 space-y-1">
          <p>{filename}</p>
          <p>{filesize}</p>
          <p>{status}</p>
        </div>
      )}
    </div>
  )
}
