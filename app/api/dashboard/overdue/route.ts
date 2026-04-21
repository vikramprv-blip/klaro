export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    const items = await prisma.workItem.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
      orderBy: {
        dueDate: "asc",
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("DASHBOARD_OVERDUE_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load overdue items" },
      { status: 500 }
    )
  }
}
