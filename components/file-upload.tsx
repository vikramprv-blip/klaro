"use client"

import { useRef } from "react"

export default function FileUpload({ onTextExtracted }: any) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    onTextExtracted("", file.name, file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
      }}
      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <p className="text-sm text-gray-700">Drop file or click</p>
    </div>
  )
}
