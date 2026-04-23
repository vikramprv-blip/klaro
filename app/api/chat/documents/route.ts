import { NextRequest, NextResponse } from "next/server"
import { hybridSearch } from "@/lib/hybrid-search"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question = String(body?.question ?? "").trim()
    const limit = Number(body?.limit ?? 8)
    const documentIds = Array.isArray(body?.documentIds)
      ? body.documentIds.map((id: unknown) => String(id))
      : undefined

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 })
    }

    const results = await hybridSearch({
      query: question,
      limit,
      documentIds,
    })

    return NextResponse.json({
      ok: true,
      mode: "retrieval_only",
      answer:
        results.length > 0
          ? "Top relevant document chunks returned. LLM answer generation is disabled."
          : "No matching document chunks found.",
      citations: results.map((hit, index) => ({
        id: index + 1,
        documentId: hit.documentId,
        title: hit.title,
        source: hit.source,
        chunkId: hit.id,
        chunkIndex: hit.chunkIndex,
        score: hit.score,
        excerpt: hit.content,
      })),
      results,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat search failed" },
      { status: 500 }
    )
  }
}
