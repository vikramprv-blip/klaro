import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const question: string = String(body?.question || "").trim()
    const incomingDocumentIds = Array.isArray(body?.documentIds)
      ? body.documentIds.map((v: unknown) => String(v).trim()).filter(Boolean)
      : []
    const clientId: string | undefined = body?.client_id ? String(body.client_id) : undefined
    const workItemId: string | undefined = body?.workItemId ? String(body.workItemId) : undefined

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    let finalDocumentIds = [...incomingDocumentIds]

    if (workItemId) {
      const rows = await prisma.$queryRawUnsafe<Array<{ documentId: string }>>(
        `
        select "documentId"::text as "documentId"
        from public."WorkItemDocument"
        where "workItemId" = $1
        `,
        workItemId
      )

      const taskDocIds = rows.map((r) => String(r.documentId))
      finalDocumentIds = Array.from(new Set([...finalDocumentIds, ...taskDocIds]))
    }

    const searchPayload = {
      query: question,
      topK: 8,
      documentIds: finalDocumentIds.length ? finalDocumentIds : undefined,
      client_id: clientId || undefined,
    }

    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/search/hybrid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchPayload),
    })

    if (!searchRes.ok) {
      const text = await searchRes.text()
      throw new Error(text || "Search failed")
    }

    const searchData = await searchRes.json()
    const hits = Array.isArray(searchData)
      ? searchData
      : Array.isArray(searchData.results)
      ? searchData.results
      : Array.isArray(searchData.hits)
      ? searchData.hits
      : []

    const contextBlocks = hits
      .map((h: any, i: number) => {
        const text = h.text || h.content || h.snippet || ""
        const title = h.documentTitle || h.title || h.fileName || "Document"
        const page = h.page != null ? ` (page ${h.page})` : ""
        return `[#${i + 1}] ${title}${page}\n${text}`
      })
      .join("\n\n")

    const systemPrompt = `
You are a professional assistant helping with documents.
Answer the user's question using ONLY the provided context.
If the answer is not in the context, say you don't know.

Be concise and structured.
`

    const finalPrompt = `
${systemPrompt}

Context:
${contextBlocks || "No context found."}

Question:
${question}
`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [{ role: "user", content: finalPrompt }],
        temperature: 0.2,
      }),
    })

    if (!groqRes.ok) {
      const text = await groqRes.text()
      throw new Error(text || "LLM call failed")
    }

    const groqData = await groqRes.json()
    const answer =
      groqData?.choices?.[0]?.message?.content ||
      "No response generated."

    const citations = hits.map((h: any) => ({
      documentId: h.documentId,
      documentTitle: h.documentTitle || h.title,
      fileName: h.fileName,
      chunkId: h.chunkId || h.id,
      page: h.page ?? null,
      snippet: h.snippet || h.text || h.content || "",
    }))

    return NextResponse.json({
      ok: true,
      answer,
      citations,
      meta: {
        workItemId: workItemId || null,
        documentCount: finalDocumentIds.length,
      },
    })
  } catch (error) {
    console.error("CHAT_DOCUMENTS_ERROR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Chat failed" },
      { status: 500 }
    )
  }
}
