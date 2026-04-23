import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const rows = await prisma.$queryRawUnsafe<Array<{
      linkId: string
      workItemId: string
      documentId: string
      createdAt: Date
      title: string | null
      file_name: string | null
      file_url: string | null
      notes: string | null
      client_id: string | null
      created_at: Date | null
      updated_at: Date | null
    }>>(
      `
      select
        wid."id" as "linkId",
        wid."workItemId",
        wid."documentId"::text as "documentId",
        wid."createdAt",
        d.title,
        d.file_name,
        d.file_url,
        d.notes,
        d.client_id,
        d.created_at,
        d.updated_at
      from public."WorkItemDocument" wid
      join public.documents d
        on d.id = wid."documentId"
      where wid."workItemId" = $1
      order by wid."createdAt" desc
      `,
      id
    )

    return NextResponse.json({
      ok: true,
      workItemId: id,
      documents: rows,
    })
  } catch (error) {
    console.error("WORK_ITEM_DOCUMENTS_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load linked documents" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()

    const documentIds = Array.isArray(body?.documentIds)
      ? body.documentIds.map((value: unknown) => String(value).trim()).filter(Boolean)
      : Array.isArray(body?.documents)
      ? body.documents
          .map((value: unknown) =>
            typeof value === "string"
              ? value.trim()
              : value && typeof value === "object" && "id" in (value as Record<string, unknown>)
              ? String((value as Record<string, unknown>).id ?? "").trim()
              : ""
          )
          .filter(Boolean)
      : body?.documentId
      ? [String(body.documentId).trim()].filter(Boolean)
      : []

    if (documentIds.length === 0) {
      return NextResponse.json(
        { error: "No document ids provided" },
        { status: 400 }
      )
    }

    const inserted: string[] = []

    for (const documentId of [...new Set(documentIds)] as string[]) {
      await prisma.$executeRawUnsafe(
        `
        insert into public."WorkItemDocument" ("id", "workItemId", "documentId", "createdAt")
        values (gen_random_uuid()::text, $1, $2::uuid, now())
        on conflict ("workItemId", "documentId") do nothing
        `,
        id,
        documentId
      )
      inserted.push(documentId)
    }

    const rows = await prisma.$queryRawUnsafe<Array<{
      linkId: string
      workItemId: string
      documentId: string
      createdAt: Date
      title: string | null
      file_name: string | null
      file_url: string | null
      notes: string | null
      client_id: string | null
      created_at: Date | null
      updated_at: Date | null
    }>>(
      `
      select
        wid."id" as "linkId",
        wid."workItemId",
        wid."documentId"::text as "documentId",
        wid."createdAt",
        d.title,
        d.file_name,
        d.file_url,
        d.notes,
        d.client_id,
        d.created_at,
        d.updated_at
      from public."WorkItemDocument" wid
      join public.documents d
        on d.id = wid."documentId"
      where wid."workItemId" = $1
      order by wid."createdAt" desc
      `,
      id
    )

    return NextResponse.json({
      ok: true,
      workItemId: id,
      linkedCount: inserted.length,
      documents: rows,
    })
  } catch (error) {
    console.error("WORK_ITEM_DOCUMENTS_POST_ERROR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to attach documents" },
      { status: 500 }
    )
  }
}
