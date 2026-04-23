import { PrismaClient } from "@prisma/client"
import { embedQuery, toPgVector } from "@/lib/voyage"

const prisma = new PrismaClient()

type SearchHit = {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  title: string
  source: string | null
  semanticScore: number
  keywordScore: number
  score: number
}

function normalizeText(text: string) {
  return text.trim().toLowerCase()
}

function keywordOverlapScore(query: string, text: string) {
  const q = normalizeText(query)
  const t = normalizeText(text)
  if (!q || !t) return 0

  const tokens = Array.from(new Set(q.split(/\s+/).filter((x) => x.length > 1)))
  if (tokens.length === 0) return 0

  let hits = 0
  for (const token of tokens) {
    if (t.includes(token)) hits += 1
  }

  const phraseBonus = t.includes(q) ? 1 : 0
  return hits / tokens.length + phraseBonus
}

export async function hybridSearch(params: {
  query: string
  limit?: number
  documentIds?: string[]
}) {
  const query = params.query.trim()
  const limit = Math.max(1, Math.min(params.limit ?? 8, 20))

  if (!query) return []

  const semanticEmbedding = await embedQuery(query)
  const vector = toPgVector(semanticEmbedding)

  const keywordRows = await prisma.$queryRawUnsafe<
    Array<{
      id: string
      documentId: string
      content: string
      chunkIndex: number
      title: string
      source: string | null
    }>
  >(
    `
    SELECT
      dc.id,
      dc."documentId",
      dc.content,
      dc."chunkIndex",
      d.title,
      d.notes AS source
    FROM "public"."document_chunks" dc
    JOIN "public"."documents" d ON d.id = dc."documentId"
    WHERE dc.content ILIKE '%' || $1 || '%'
      AND ($2::text[] IS NULL OR dc."documentId" = ANY($2::text[]))
    ORDER BY dc."chunkIndex" ASC
    LIMIT $3
    `,
    query,
    params.documentIds?.length ? params.documentIds : null,
    limit * 3
  )

  const semanticRows = await prisma.$queryRawUnsafe<
    Array<{
      id: string
      documentId: string
      content: string
      chunkIndex: number
      title: string
      source: string | null
      distance: number
    }>
  >(
    `
    SELECT
      dc.id,
      dc."documentId",
      dc.content,
      dc."chunkIndex",
      d.title,
      d.notes AS source,
      (dc.embedding <=> $1::vector) AS distance
    FROM "public"."document_chunks" dc
    JOIN "public"."documents" d ON d.id = dc."documentId"
    WHERE ($2::text[] IS NULL OR dc."documentId" = ANY($2::text[]))
    ORDER BY dc.embedding <=> $1::vector ASC
    LIMIT $3
    `,
    vector,
    params.documentIds?.length ? params.documentIds : null,
    Math.max(limit * 3, 12)
  )

  const merged = new Map<string, SearchHit>()

  for (const row of keywordRows) {
    merged.set(row.id, {
      id: row.id,
      documentId: row.documentId,
      content: row.content,
      chunkIndex: row.chunkIndex,
      title: row.title,
      source: row.source ?? null,
      semanticScore: 0,
      keywordScore: keywordOverlapScore(query, row.content),
      score: 0,
    })
  }

  for (const row of semanticRows) {
    const semanticScore = 1 / (1 + Number(row.distance))
    const existing = merged.get(row.id)

    if (existing) {
      existing.semanticScore = Math.max(existing.semanticScore, semanticScore)
    } else {
      merged.set(row.id, {
        id: row.id,
        documentId: row.documentId,
        content: row.content,
        chunkIndex: row.chunkIndex,
        title: row.title,
        source: row.source ?? null,
        semanticScore,
        keywordScore: keywordOverlapScore(query, row.content),
        score: 0,
      })
    }
  }

  return Array.from(merged.values())
    .map((row) => ({
      ...row,
      score: row.semanticScore * 0.65 + row.keywordScore * 0.35,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
