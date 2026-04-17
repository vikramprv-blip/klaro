import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logWorkItemActivity } from "@/lib/work-item-activity"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const dueDate = body?.dueDate ? new Date(body.dueDate) : null

    const updated = await prisma.workItem.update({
      where: { id },
      data: { dueDate },
      include: {
        client: true,
      },
    })

    await logWorkItemActivity({
      workItemId: id,
      type: dueDate ? "due_date_set" : "due_date_cleared",
      message: dueDate ? "Set due date" : "Cleared due date",
      meta: dueDate ? { dueDate: dueDate.toISOString() } : undefined,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/workboard/[id]/due-date failed", error)
    return NextResponse.json(
      { error: "Failed to update due date" },
      { status: 500 },
    )
  }
}
