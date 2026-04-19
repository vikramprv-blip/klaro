import { NextRequest, NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const docs = Array.isArray(body?.documents) ? body.documents : []

    return NextResponse.json({
      ok: true,
      workItemId: id,
      documents: docs,
      createdCount: 0,
      message: "WorkDocument table not available yet",
    })
  } catch (error) {
    console.error("WORK_ITEM_DOCUMENTS_POST_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to attach documents" },
      { status: 500 }
    )
  }
}
