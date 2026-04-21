export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfWeek } from "date-fns"

export async function GET() {
  try {
    const now = new Date()
    const weekStart = startOfWeek(now)

    const totalTasks = await prisma.workItem.count({
      where: { status: { not: "done" } }
    })

    const completedThisWeek = await prisma.workItem.count({
      where: {
        status: "done",
        updatedAt: { gte: weekStart }
      }
    })

    const overdue = await prisma.workItem.count({
      where: {
        dueDate: { lt: now },
        status: { not: "done" }
      }
    })

    // workload by user (fallback if no user model relation)
    const workloadRaw = await prisma.workItem.groupBy({
      by: ["status"],
      _count: true
    })

    // recent activity
    const recent = await prisma.workItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { client: true }
    })

    return NextResponse.json({
      totalTasks,
      completedThisWeek,
      overdue,
      assignedToYou: totalTasks,
      unreadNotifications: 0,
      workload: workloadRaw,
      recent
    })
  } catch (error) {
    console.error("LIVE DASHBOARD ERROR:", error)

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}
