import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const item = await prisma.workItem.findUnique({
      where: { id },
      include: { client: true },
    })

    if (!item) {
      return NextResponse.json({ error: "Work item not found" }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error("WORK_ITEM_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load work item" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()

    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = String(body.title)
    if (body.description !== undefined) data.description = body.description ? String(body.description) : null
    if (body.status !== undefined) data.status = String(body.status)
    if (body.priority !== undefined) data.priority = String(body.priority)
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.clientId !== undefined) data.clientId = body.clientId ? String(body.clientId) : null

    const updated = await prisma.workItem.update({
      where: { id },
      data,
      include: { client: true },
    })

    return NextResponse.json({ item: updated })
  } catch (error) {
    console.error("WORK_ITEM_PATCH_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to update work item" },
      { status: 500 }
    )
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    await prisma.workItem.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("WORK_ITEM_DELETE_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to delete work item" },
      { status: 500 }
    )
  }
}
