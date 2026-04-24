"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function DocumentPreviewPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [doc, setDoc] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(setDoc)
  }, [id])

  if (!doc) return <p className="p-8 text-sm text-gray-400">Loading...</p>

  const isPDF = doc.fileUrl?.toLowerCase().endsWith(".pdf")
  const isImage = doc.fileUrl?.match(/\.(jpg|jpeg|png|webp)$/i)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-medium">{doc.filename}</h1>

      {isPDF && (
        <iframe
          src={doc.fileUrl}
          className="w-full h-[80vh] border rounded"
        />
      )}

      {isImage && (
        <img
          src={doc.fileUrl}
          className="max-w-full rounded border"
        />
      )}

      {!isPDF && !isImage && (
        <a
          href={doc.fileUrl}
          target="_blank"
          className="text-blue-600 underline"
        >
          Open file
        </a>
      )}
    </div>
  )
}
