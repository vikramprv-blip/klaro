import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.title !== undefined && !String(body.title).trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    if (
      body.status !== undefined &&
      !["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }


    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.workItem.update({
        where: { id },
        data: {
          ...(body.status !== undefined ? { status: body.status } : {}),
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.priority !== undefined ? { priority: body.priority } : {}),
          ...(body.dueDate !== undefined
            ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
            : {}),
          ...(body.archivedAt !== undefined
            ? { archivedAt: body.archivedAt ? new Date(body.archivedAt) : null }
            : {}),
        },
      })

      if (body.assigneeId !== undefined) {
        await tx.workAssignment.deleteMany({
          where: { workItemId: id },
        })

        if (body.assigneeId) {
          await tx.workAssignment.create({
            data: {
              workItemId: id,
              userId: body.assigneeId,
              role: "OWNER",
            },
          })
        }
      }

      return updated
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to update work item", error)
    return NextResponse.json(
      { error: "Failed to update work item" },
      { status: 500 }
    )
  }
}


export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params

    await prisma.workAssignment.deleteMany({
      where: { workItemId: id },
    })

    await prisma.workDocument.deleteMany({
      where: { workItemId: id },
    })

    await prisma.invoice.deleteMany({
      where: { workItemId: id },
    })

    await prisma.workItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete work item", error)
    return NextResponse.json(
      { error: "Failed to delete work item" },
      { status: 500 }
    )
  }
}
