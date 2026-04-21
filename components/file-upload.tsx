"use client"
import { useState, useRef, useCallback, useEffect } from "react"

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
  const [progress, setProgress]     = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Load pdf.js from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).pdfjsLib) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      }
      document.head.appendChild(script)
    }
  }, [])

  const extractPdfText = async (file: File): Promise<string> => {
    // Wait for pdfjsLib to load
    let attempts = 0
    while (!(window as any).pdfjsLib && attempts < 20) {
      await new Promise(r => setTimeout(r, 300))
      attempts++
    }
    if (!(window as any).pdfjsLib) throw new Error("PDF library failed to load")

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ""
    const total = pdf.numPages

    for (let i = 1; i <= total; i++) {
      setProgress(`Extracting page ${i} of ${total}...`)
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n"
    }
    return fullText
  }

  const processFile = useCallback(async (file: File) => {
    setProcessing(true)
    setError("")
    setFilename(file.name)
    setProgress("")

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

      // PDF — extract client-side with pdf.js
      if (ext === "pdf") {
        setProgress("Loading PDF...")
        const text = await extractPdfText(file)
        if (!text.trim()) throw new Error("No text found in PDF. It may be a scanned image — please copy-paste text instead.")
        onTextExtracted(text, file.name)
        setProcessing(false)
        setProgress("")
        return
      }

      // CSV / TXT — read directly
      if (["csv", "txt"].includes(ext)) {
        const text = await file.text()
        onTextExtracted(text, file.name)
        setProcessing(false)
        return
      }

      // Excel — send to server
      if (["xlsx", "xls"].includes(ext)) {
        setProgress("Processing Excel...")
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/ca/ai/extract-text", { method: "POST", body: formData })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        onTextExtracted(data.text, file.name)
        setProcessing(false)
        setProgress("")
        return
      }

      throw new Error(`Unsupported file type: .${ext}`)
    } catch (e: any) {
      setError(e.message ?? "Failed to process file")
      setFilename("")
      setProcessing(false)
      setProgress("")
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
    e.target.value = ""
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
        <input ref={inputRef} type="file" accept={accept} onChange={onFileChange} className="hidden" />
        {processing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            <p className="text-xs text-gray-400">{progress || `Processing ${filename}...`}</p>
          </div>
        ) : filename ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-green-700">✓ {filename}</p>
            <p className="text-xs text-gray-400">Click or drop another file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-lg">↑</div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-400">{hint}</p>
            <p className="text-xs text-gray-300 mt-1">or click to browse</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
