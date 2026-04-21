export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const clientId = searchParams.get("clientId")
    const q = searchParams.get("q")

    const items = await prisma.workItem.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(clientId ? { clientId } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        client: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("WORK_ITEMS_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load work items" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const created = await prisma.workItem.create({
      data: {
        title: String(body.title || "").trim(),
        description: body.description ? String(body.description) : null,
        status: body.status ? String(body.status) : "TODO",
        priority: body.priority ? String(body.priority) : "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        clientId: body.clientId ? String(body.clientId) : null,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json({ item: created }, { status: 201 })
  } catch (error) {
    console.error("WORK_ITEMS_POST_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to create work item" },
      { status: 500 }
    )
  }
}
