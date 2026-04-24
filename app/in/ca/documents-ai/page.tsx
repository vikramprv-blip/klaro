"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

type ClientItem = {
  id: string
  name: string
}

type DocumentItem = {
  id: string
  title?: string | null
  fileName?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

type SearchHit = {
  chunkId?: string
  documentId?: string
  documentTitle?: string
  fileName?: string
  text?: string
  content?: string
  snippet?: string
  score?: number
  page?: number | null
}

type ChatCitation = {
  documentId?: string
  documentTitle?: string
  fileName?: string
  chunkId?: string
  page?: number | null
  snippet?: string
  text?: string
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  citations?: ChatCitation[]
}

type LinkedWorkItemDocument = {
  linkId?: string
  workItemId?: string
  documentId?: string
  title?: string | null
  file_name?: string | null
  file_url?: string | null
  notes?: string | null
  client_id?: string | null
}

type WorkItemResponse = {
  item?: {
    id: string
    title?: string | null
    clientId?: string | null
  }
}

const SUGGESTED_PROMPTS = [
  "Summarise the key points from these documents.",
  "What are the important deadlines mentioned?",
  "List compliance risks and missing information.",
  "Draft a client-ready summary in simple language.",
  "What questions should I ask the client next?",
  "Extract action items and organise them as a checklist.",
]

function DocumentsAIPageInner() {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<ClientItem[]>([])
  const initialClientId = searchParams?.get("client_id") || ""
  const initialDocumentId = searchParams?.get("document_id") || ""
  const initialWorkItemId = searchParams?.get("work_item_id") || ""
  const [selectedClientId, setSelectedClientId] = useState(initialClientId)
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedCitations, setSelectedCitations] = useState<ChatCitation[]>([])
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [workItemTitle, setWorkItemTitle] = useState("")
  const [loadingWorkItemContext, setLoadingWorkItemContext] = useState(false)
  const seededDocumentIdRef = useRef(false)
  const seededWorkItemDocsRef = useRef(false)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  async function loadClients() {
    try {
      const res = await fetch("/api/clients", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      const rows = Array.isArray(data?.clients) ? data.clients : Array.isArray(data) ? data : []
      setClients(rows)
    } catch {
      setClients([])
    }
  }

  async function loadDocuments() {
    setLoadingDocs(true)
    try {
      const endpoints = ["/api/documents/list", "/api/documents"]
      for (const endpoint of endpoints) {
        const qs =
          endpoint === "/api/documents/list" && selectedClientId
            ? `?client_id=${encodeURIComponent(selectedClientId)}`
            : ""
        const res = await fetch(`${endpoint}${qs}`, { cache: "no-store" })
        if (!res.ok) continue
        const data = await res.json()
        const docs = Array.isArray(data)
          ? data
          : Array.isArray(data.documents)
          ? data.documents
          : Array.isArray(data.items)
          ? data.items
          : []
        if (docs.length || endpoint === endpoints[endpoints.length - 1]) {
          setDocuments(docs)
          return
        }
      }
      setDocuments([])
    } finally {
      setLoadingDocs(false)
    }
  }

  async function loadWorkItemContext() {
    if (!initialWorkItemId || seededWorkItemDocsRef.current) return

    setLoadingWorkItemContext(true)
    try {
      const [itemRes, docsRes] = await Promise.all([
        fetch(`/api/work-items/${encodeURIComponent(initialWorkItemId)}`, { cache: "no-store" }),
        fetch(`/api/work-items/${encodeURIComponent(initialWorkItemId)}/documents`, { cache: "no-store" }),
      ])

      if (itemRes.ok) {
        const itemData = (await itemRes.json()) as WorkItemResponse
        const item = itemData?.item
        if (item?.title) {
          setWorkItemTitle(item.title)
        }
        if (!selectedClientId && item?.clientId) {
          setSelectedClientId(item.clientId)
        }
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json()
        const linkedDocs = Array.isArray(docsData?.documents) ? (docsData.documents as LinkedWorkItemDocument[]) : []
        const linkedDocumentIds = linkedDocs
          .map((doc) => String(doc.documentId || "").trim())
          .filter(Boolean)

        if (linkedDocumentIds.length) {
          setSelectedDocumentIds(linkedDocumentIds)
        }
      }

      seededWorkItemDocsRef.current = true
    } catch {
      // no-op
    } finally {
      setLoadingWorkItemContext(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [selectedClientId])

  useEffect(() => {
    void loadWorkItemContext()
  }, [initialWorkItemId])

  useEffect(() => {
    if (!initialDocumentId || seededDocumentIdRef.current || documents.length === 0) return
    const found = documents.find((doc) => doc.id === initialDocumentId)
    if (!found) return
    setSelectedDocumentIds((prev) => (prev.includes(initialDocumentId) ? prev : [...prev, initialDocumentId]))
    seededDocumentIdRef.current = true
  }, [documents, initialDocumentId])

  useEffect(() => {
    if (!chatScrollRef.current) return
    chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, chatLoading])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    if (selectedClientId) {
      formData.append("client_id", selectedClientId)
    }

    setUploading(true)
    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Upload failed")
      }

      await loadDocuments()
      e.target.value = ""
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function runSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const payload = {
        query: searchQuery,
        topK: 8,
        documentIds: selectedDocumentIds,
        client_id: selectedClientId || undefined,
      }

      const res = await fetch("/api/search/hybrid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Search failed")
      }

      const data = await res.json()
      const results = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.hits)
        ? data.hits
        : []

      setSearchResults(results)
      setSelectedCitations(
        results.map((r: any) => ({
          documentId: r.documentId,
          documentTitle: r.documentTitle || r.title,
          fileName: r.fileName || r.file_name,
          chunkId: r.chunkId || r.id,
          page: r.page ?? null,
          snippet: r.snippet || r.text || r.content || "",
          text: r.text || r.content || r.snippet || "",
        }))
      )
    } catch (error) {
      alert(error instanceof Error ? error.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }

  function applySuggestedPrompt(prompt: string) {
    setChatInput(prompt)
  }

  async function sendChat() {
    if (!chatInput.trim()) return

    const question = chatInput
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }]
    setMessages(nextMessages)
    setChatLoading(true)
    setChatInput("")

    try {
      const payload = {
        question,
        messages: nextMessages,
        documentIds: selectedDocumentIds,
        client_id: selectedClientId || undefined,
        workItemId: initialWorkItemId || undefined,
      }

      const res = await fetch("/api/chat/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Chat failed")
      }

      const data = await res.json()

      const answer =
        data?.answer ||
        data?.response ||
        data?.message ||
        data?.content ||
        "No answer returned."

      const citations = Array.isArray(data?.citations)
        ? data.citations
        : Array.isArray(data?.sources)
        ? data.sources
        : []

      setMessages([...nextMessages, { role: "assistant", content: answer, citations }])
      setSelectedCitations(citations)
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Chat failed",
          citations: [],
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const activeDocCount = useMemo(() => selectedDocumentIds.length, [selectedDocumentIds])

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents AI</h1>
        <p className="text-sm text-gray-600">
          Upload, search, and chat over indexed documents using existing retrieval APIs.
        </p>

        {initialWorkItemId ? (
          <div className="mt-3 rounded-xl border bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <div className="font-medium">
              Task AI context {workItemTitle ? `• ${workItemTitle}` : ""}
            </div>
            <div className="mt-1">
              Work item: {initialWorkItemId}
              {loadingWorkItemContext ? " • loading linked docs..." : ""}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border p-4 space-y-4">
            <div>
              <h2 className="font-medium">Upload</h2>
              <p className="text-sm text-gray-600">PDF upload and auto-index.</p>
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} />
            <div className="text-sm text-gray-500">{uploading ? "Uploading..." : "Ready"}</div>
          </section>

          <section className="rounded-2xl border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">Documents</h2>
                <p className="text-sm text-gray-600">Select docs to scope search/chat.</p>
              </div>
              <button className="text-sm underline" onClick={loadDocuments} type="button">
                Refresh
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {loadingDocs ? "Loading..." : `${documents.length} documents`}
            </div>
            {initialDocumentId ? (
              <div className="text-xs text-blue-600">Document focus: {initialDocumentId}</div>
            ) : null}

            <div className="max-h-[420px] overflow-auto space-y-2">
              {documents.map((doc) => {
                const checked = selectedDocumentIds.includes(doc.id)
                return (
                  <label key={doc.id} className="block rounded-xl border p-3 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedDocumentIds((prev) =>
                            checked ? prev.filter((id) => id !== doc.id) : [...prev, doc.id]
                          )
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium break-words">
                          {doc.title || doc.fileName || doc.id}
                        </div>
                        {doc.notes ? (
                          <div className="text-sm text-gray-600 break-words">{doc.notes}</div>
                        ) : null}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border p-4 space-y-4">
            <div>
              <h2 className="font-medium">Search</h2>
              <p className="text-sm text-gray-600">Hybrid search across selected documents.</p>
            </div>

            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch()
                }}
                placeholder="Search documents..."
                className="w-full rounded-xl border px-3 py-2"
              />
              <button onClick={runSearch} disabled={searching} className="rounded-xl border px-4 py-2">
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Scope: {activeDocCount ? `${activeDocCount} selected` : "all documents"}
            </div>

            <div className="max-h-[420px] overflow-auto space-y-3">
              {searchResults.map((hit, index) => (
                <button
                  key={`${hit.chunkId || hit.documentId || "hit"}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedCitations([
                      {
                        documentId: hit.documentId,
                        documentTitle: hit.documentTitle,
                        fileName: hit.fileName,
                        chunkId: hit.chunkId,
                        page: hit.page ?? null,
                        snippet: hit.snippet || hit.text || hit.content || "",
                        text: hit.text || hit.content || hit.snippet || "",
                      },
                    ])
                  }
                  className="block w-full rounded-xl border p-3 text-left"
                >
                  <div className="font-medium">{hit.documentTitle || hit.fileName || "Untitled document"}</div>
                  <div className="text-xs text-gray-500">
                    {hit.page != null ? `Page ${hit.page}` : "Page n/a"}
                    {typeof hit.score === "number" ? ` • Score ${hit.score.toFixed(3)}` : ""}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {hit.snippet || hit.text || hit.content || ""}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border p-4 space-y-4">
            <div>
              <h2 className="font-medium">Chat</h2>
              <p className="text-sm text-gray-600">Ask questions over retrieved document context.</p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Suggested prompts</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => applySuggestedPrompt(prompt)}
                    className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div ref={chatScrollRef} className="max-h-[420px] overflow-auto space-y-3 rounded-xl border p-3">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet.</div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={`${msg.role}-${index}`}
                    className="rounded-xl border p-3"
                    onClick={() => setSelectedCitations(msg.citations || [])}
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-500">{msg.role}</div>
                    <div className="mt-1 whitespace-pre-wrap">{msg.content}</div>
                    {msg.citations?.length ? (
                      <div className="mt-2 text-xs text-gray-500">
                        {msg.citations.length} citation{msg.citations.length === 1 ? "" : "s"}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void sendChat()
                  }
                }}
                placeholder="Ask a question about your documents..."
                className="min-h-[96px] w-full rounded-xl border px-3 py-2"
              />
              <button onClick={() => void sendChat()} disabled={chatLoading} className="rounded-xl border px-4 py-2">
                {chatLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border p-4 space-y-4">
            <div>
              <h2 className="font-medium">Citations</h2>
              <p className="text-sm text-gray-600">Search or chat citations appear here.</p>
            </div>

            <div className="max-h-[860px] overflow-auto space-y-3">
              {selectedCitations.length === 0 ? (
                <div className="text-sm text-gray-500">No citations selected.</div>
              ) : (
                selectedCitations.map((citation, index) => (
                  <div key={`${citation.chunkId || citation.documentId || "citation"}-${index}`} className="rounded-xl border p-3">
                    <div className="font-medium">
                      {citation.documentTitle || citation.fileName || citation.documentId || "Citation"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {citation.page != null ? `Page ${citation.page}` : "Page n/a"}
                    </div>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                      {citation.snippet || citation.text || ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function DocumentsAIPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-6">Loading...</div>}>
      <DocumentsAIPageInner />
    </Suspense>
  )
}
