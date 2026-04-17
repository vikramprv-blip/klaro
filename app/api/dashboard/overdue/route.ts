import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    const items = await prisma.workItem.findMany({
      where: {
        archivedAt: null,
        dueDate: { lt: now },
        status: { not: "DONE" as any },
      },
      include: {
        client: true,
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      take: 20,
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET /api/dashboard/overdue failed", error)
    return NextResponse.json(
      { error: "Failed to fetch overdue work items" },
      { status: 500 },
    )
  }
}
