export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    const overdueItems = await prisma.workItem.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    })

    return NextResponse.json({ count: overdueItems.length })
  } catch (error) {
    console.error("OVERDUE CRON ERROR:", error)
    return NextResponse.json(
      { error: "Failed to fetch overdue items" },
      { status: 500 }
    )
  }
}
