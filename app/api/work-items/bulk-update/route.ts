export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : []
    const status = typeof body?.status === "string" ? body.status : undefined
    const priority = typeof body?.priority === "string" ? body.priority : undefined
    const assigneeId =
      typeof body?.assigneeId === "string"
        ? body.assigneeId
        : body?.assigneeId === null
          ? null
          : undefined
    const archive = body?.archive === true

    if (ids.length === 0) {
      return NextResponse.json({ error: "No work item ids provided" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}

    if (status) data.status = status
    if (priority) data.priority = priority
    if (assigneeId !== undefined) data.assigneeId = assigneeId
    if (archive) data.archivedAt = new Date()

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    const result = await prisma.workItem.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
    })
  } catch (error) {
    console.error("PATCH /api/work-items/bulk-update failed", error)
    return NextResponse.json({ error: "Failed to bulk update work items" }, { status: 500 })
  }
}
