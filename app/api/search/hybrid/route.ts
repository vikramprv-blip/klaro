import { NextRequest, NextResponse } from "next/server"
import { hybridSearch } from "@/lib/hybrid-search"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = String(body?.query ?? "").trim()
    const limit = Number(body?.limit ?? 8)
    const documentIds = Array.isArray(body?.documentIds)
      ? body.documentIds.map((id: unknown) => String(id))
      : undefined

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    const results = await hybridSearch({ query, limit, documentIds })
    return NextResponse.json({ ok: true, results })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Search failed" },
      { status: 500 }
    )
  }
}
