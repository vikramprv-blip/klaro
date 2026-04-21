"use client"
import { useState, useRef, useCallback } from "react"

type FileUploadProps = {
  onTextExtracted: (text: string, filename: string) => void
  accept?: string
  label?: string
  hint?: string
}

export default function FileUpload({ onTextExtracted, accept = ".pdf,.xlsx,.xls,.csv,.txt", label = "Drop file here", hint = "PDF, Excel, CSV or TXT" }: FileUploadProps) {
  const [dragging, setDragging]     = useState(false)
  const [processing, setProcessing] = useState(false)
  const [filename, setFilename]     = useState("")
  const [error, setError]           = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setProcessing(true)
    setError("")
    setFilename(file.name)

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

      // Plain text / CSV
      if (["txt", "csv"].includes(ext)) {
        const text = await file.text()
        onTextExtracted(text, file.name)
        setProcessing(false)
        return
      }

      // PDF — send to API for text extraction
      if (ext === "pdf") {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/ca/ai/extract-text", { method: "POST", body: formData })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        onTextExtracted(data.text, file.name)
        setProcessing(false)
        return
      }

      // Excel — send to API for extraction
      if (["xlsx", "xls"].includes(ext)) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/ca/ai/extract-text", { method: "POST", body: formData })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        onTextExtracted(data.text, file.name)
        setProcessing(false)
        return
      }

      throw new Error(`Unsupported file type: .${ext}`)
    } catch (e: any) {
      setError(e.message ?? "Failed to process file")
      setProcessing(false)
    }
  }, [onTextExtracted])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="hidden"
        />
        {processing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Extracting text from {filename}...</p>
          </div>
        ) : filename ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-green-700">✓ {filename}</p>
            <p className="text-xs text-gray-400">Click or drop another file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">↑</div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-400">{hint}</p>
            <p className="text-xs text-gray-300 mt-1">or click to browse</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
