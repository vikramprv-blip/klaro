"use client"

import { useRef, useState } from "react"

type FileUploadProps = {
  onTextExtracted: (text: string, filename: string) => void
  accept?: string
  label?: string
  hint?: string
}

export default function FileUpload({
  onTextExtracted,
  accept = ".pdf,.xlsx,.xls,.csv,.txt",
  label = "Drop file here",
  hint = "PDF, Excel, CSV or TXT",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState("idle")

  async function handleFile(file: File) {
    setMsg(`picked: ${file.name}`)
    try {
      const text = await file.text().catch(() => "")
      onTextExtracted(text || `[binary file selected] ${file.name}`, file.name)
      setMsg(`processed: ${file.name}`)
    } catch (e: any) {
      setMsg(`error: ${e?.message || "failed"}`)
    }
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => {
          console.log("wrapper click")
          inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          console.log("drag over")
        }}
        onDrop={(e) => {
          e.preventDefault()
          console.log("drop", e.dataTransfer.files?.[0]?.name)
          const file = e.dataTransfer.files?.[0]
          if (file) handleFile(file)
        }}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onClick={() => console.log("input click")}
          onChange={(e) => {
            console.log("input change", e.target.files?.[0]?.name)
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
          className="hidden"
        />
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{hint}</p>
      </div>

      <div className="text-xs text-gray-500">debug: {msg}</div>
    </div>
  )
}
