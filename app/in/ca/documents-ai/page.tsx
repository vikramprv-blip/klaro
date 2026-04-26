"use client"
import { useState } from "react"

type SearchResult = {
  documentId: string
  title: string
  fileName: string
  fileUrl: string
  fileType: string
  clientId: string | null
  snippet: string
  semanticScore: number
  createdAt: string
}

const DOC_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
}

export default function AIDocumentsPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setSearched(false)

    try {
      const res = await fetch("/api/documents/search-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setResults([])
      } else {
        setResults(Array.isArray(data.results) ? data.results : [])
      }
    } catch (e: any) {
      setError(e.message)
      setResults([])
    }
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">AI Document Search</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search across all uploaded documents using AI — finds relevant content even with different wording
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={search} className="flex gap-3 mb-8">
        <input
          className="flex-1 border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          placeholder="e.g. GST liability for Q3, advance tax payment, capital gains..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-black text-white rounded-2xl text-sm font-medium disabled:opacity-40">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">No documents found for "{query}"</p>
              <p className="text-xs mt-2 text-gray-300">Try uploading documents first from the Documents page</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-4">{results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</p>
              {results.map((r, i) => (
                <div key={i} className="border rounded-2xl p-5 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl mt-0.5">
                        {DOC_ICONS[r.fileType] || "📎"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{r.title || r.fileName}</h3>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                            {Math.round(r.semanticScore * 100)}% match
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{r.fileName}</p>
                        {r.snippet && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            ...{r.snippet}...
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(r.fileUrl, "_blank")}
                      className="shrink-0 px-3 py-1.5 border rounded-xl text-xs hover:bg-gray-50 text-gray-600">
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!searched && !loading && (
        <div className="text-center py-16 text-gray-300">
          <p className="text-5xl mb-4">✨</p>
          <p className="text-sm text-gray-400">Type a question or keyword to search your documents</p>
          <p className="text-xs mt-2">Searches PDFs, Word docs, and all uploaded files</p>
        </div>
      )}
    </div>
  )
}
