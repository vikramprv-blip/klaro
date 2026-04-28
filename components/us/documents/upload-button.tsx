"use client"
import { useRef, useState } from "react"

interface UploadButtonProps {
  matterId?: string
  clientId?: string
  onUploaded?: (file: any) => void
  disabled?: boolean
  locked?: boolean
  label?: string
}

export default function UploadButton({ matterId, clientId, onUploaded, disabled, locked, label = "Upload Document" }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1]
        const res = await fetch("/api/us/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_content_b64: base64,
            matter_id: matterId || null,
            client_id: clientId || null,
          }),
        })
        const data = await res.json()
        if (data.ok && onUploaded) onUploaded(data.document)
        else if (!data.ok && data.upgrade_required) {
          alert("You've reached your document upload limit. Please upgrade your plan.")
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  if (locked) return (
    <button type="button" onClick={() => alert("Upgrade your plan to upload more documents.")} className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2">↑ {label} 🔒</button>
  )

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFile}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2">
        {uploading ? (
          <>
            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <span>↑</span>
            {label}
          </>
        )}
      </button>
    </>
  )
}
