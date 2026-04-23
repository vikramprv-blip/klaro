import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const ids = Array.isArray(body?.ids) ? body.ids.filter((v: unknown) => typeof v === "string") : []
    if (!ids.length) {
      return NextResponse.json({ error: "ids are required" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}

    if (typeof body?.status === "string") data.status = body.status
    if (typeof body?.priority === "string") data.priority = body.priority
    if (body?.urgent === true) data.priority = "HIGH"
    if (body?.dueDate === null) data.dueDate = null
    else if (typeof body?.dueDate === "string" && body.dueDate) data.dueDate = new Date(body.dueDate)

    const assigneeId =
      typeof body?.assigneeId === "string"
        ? body.assigneeId
        : body?.assigneeId === null
          ? null
          : undefined

    if (assigneeId !== undefined) data.assigneeId = assigneeId

    const result = await prisma.workItem.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data,
    })

    return NextResponse.json({
      ok: true,
      count: result.count,
    })
  } catch (error) {
    console.error("bulk update failed", error)
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 })
  }
}
