import { prisma } from "@/lib/prisma"

type SearchHit = {
  id?: string
  documentId?: string
  clientId?: string | null
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

function pickText(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    const preferred =
      obj.answer ??
      obj.response ??
      obj.message ??
      obj.result ??
      obj.text ??
      obj.content
    if (typeof preferred === "string") return preferred
  }
  return ""
}

function extractHits(payload: any): SearchHit[] {
  const candidates = [
    payload?.results,
    payload?.items,
    payload?.documents,
    payload?.hits,
    Array.isArray(payload) ? payload : null,
  ].find(Array.isArray)

  if (!Array.isArray(candidates)) return []

  return candidates
    .map((item: any) => ({
      id: typeof item?.id === "string" ? item.id : undefined,
      documentId:
        typeof item?.documentId === "string"
          ? item.documentId
          : typeof item?.document?.id === "string"
            ? item.document.id
            : typeof item?.id === "string"
              ? item.id
              : undefined,
      clientId:
        typeof item?.clientId === "string"
          ? item.clientId
          : typeof item?.document?.clientId === "string"
            ? item.document.clientId
            : null,
    }))
    .filter((item) => !!item.documentId)
}

async function resolveJoinTable() {
  const rows = await prisma.$queryRawUnsafe<Array<{ table_name: string; column_name: string }>>(`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and (
        lower(column_name) in ('workitemid', 'work_item_id', 'documentid', 'document_id')
        or lower(table_name) like '%workitem%'
        or lower(table_name) like '%work_item%'
        or lower(table_name) like '%document%'
      )
    order by table_name, column_name
  `)

  const grouped = new Map<string, Set<string>>()

  for (const row of rows) {
    const table = row.table_name
    const column = row.column_name
    if (!grouped.has(table)) grouped.set(table, new Set())
    grouped.get(table)!.add(column)
  }

  const candidates = Array.from(grouped.entries())
    .map(([table, columns]) => ({ table, columns: Array.from(columns) }))
    .filter(({ columns }) => {
      const lower = columns.map((c) => c.toLowerCase())
      const hasWorkItem =
        lower.includes("workitemid") || lower.includes("work_item_id")
      const hasDocument =
        lower.includes("documentid") || lower.includes("document_id")
      return hasWorkItem && hasDocument
    })

  if (!candidates.length) {
    throw new Error("Could not find work item ↔ document join table in public schema")
  }

  const best = candidates[0]
  const workItemColumn =
    best.columns.find((c) => c.toLowerCase() === "workitemid") ||
    best.columns.find((c) => c.toLowerCase() === "work_item_id")

  const documentColumn =
    best.columns.find((c) => c.toLowerCase() === "documentid") ||
    best.columns.find((c) => c.toLowerCase() === "document_id")

  if (!workItemColumn || !documentColumn) {
    throw new Error("Could not resolve join table column names")
  }

  return {
    table: best.table,
    workItemColumn,
    documentColumn,
  }
}

export async function autoLinkWorkItem(workItemId: string) {
  const workItem = await prisma.workItem.findUnique({
    where: { id: workItemId },
    select: {
      id: true,
      title: true,
      description: true,
      clientId: true,
    },
  })

  if (!workItem) {
    throw new Error("Work item not found")
  }

  const query = [workItem.title, workItem.description || ""]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  if (!query) {
    return { linkedCount: 0, documentIds: [] as string[] }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/search/hybrid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ query, topK: 5, limit: 5 }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Search failed"
    )
  }

  const rawHits = extractHits(data)

  const preferredHits = rawHits.filter(
    (hit) => !workItem.clientId || !hit.clientId || hit.clientId === workItem.clientId
  )

  const chosen = (preferredHits.length ? preferredHits : rawHits)
    .map((hit) => hit.documentId!)
    .filter(Boolean)

  const documentIds = unique(chosen).slice(0, 5)

  if (!documentIds.length) {
    return {
      linkedCount: 0,
      documentIds: [],
      searchPreview: pickText(data),
    }
  }

  const join = await resolveJoinTable()

  for (const documentId of documentIds) {
    await prisma.$executeRawUnsafe(
      `insert into "${join.table}" ("${join.workItemColumn}", "${join.documentColumn}") values ($1, $2) on conflict do nothing`,
      workItem.id,
      documentId
    )
  }

  return {
    linkedCount: documentIds.length,
    documentIds,
    joinTable: join.table,
  }
}
