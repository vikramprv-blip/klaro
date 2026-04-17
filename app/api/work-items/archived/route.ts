import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.workItem.findMany({
      where: {
        archivedAt: {
          not: null,
        },
      },
      include: {
        client: true,
      },
      orderBy: [{ archivedAt: "desc" }, { updatedAt: "desc" }],
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET /api/work-items/archived failed", error)
    return NextResponse.json(
      { error: "Failed to fetch archived work items" },
      { status: 500 },
    )
  }
}
