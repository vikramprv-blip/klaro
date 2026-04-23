export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string; docId: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id, docId } = await params

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
        and wid."documentId" = $2::uuid
      limit 1
      `,
      id,
      docId
    )

    if (!rows.length) {
      return NextResponse.json({ error: "Linked document not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, document: rows[0] })
  } catch (error) {
    console.error("WORK_ITEM_DOCUMENT_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load linked document" },
      { status: 500 }
    )
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id, docId } = await params

    await prisma.$executeRawUnsafe(
      `
      delete from public."WorkItemDocument"
      where "workItemId" = $1
        and "documentId" = $2::uuid
      `,
      id,
      docId
    )

    return NextResponse.json({ ok: true, workItemId: id, documentId: docId })
  } catch (error) {
    console.error("WORK_ITEM_DOCUMENT_DELETE_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to unlink document" },
      { status: 500 }
    )
  }
}
