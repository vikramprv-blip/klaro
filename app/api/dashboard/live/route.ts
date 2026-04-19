import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfWeek } from "date-fns"

export async function GET() {
  const now = new Date()
  const weekStart = startOfWeek(now)

  const [
    totalTasks,
    completedThisWeek,
    overdue,
    assignedToYou,
    unreadNotifications
  ] = await Promise.all([
    prisma.workItem.count({ where: { status: { not: "done" } } }),
    prisma.workItem.count({
      where: {
        status: "done",
        updatedAt: { gte: weekStart }
      }
    }),
    prisma.workItem.count({
      where: {
        dueDate: { lt: now },
        status: { not: "done" }
      }
    }),
    // TEMP: fallback = same as totalTasks
    prisma.workItem.count({ where: { status: { not: "done" } } }),
    prisma.notification.count({
      where: {
        read: false
      }
    })
  ])

  return NextResponse.json({
    totalTasks,
    completedThisWeek,
    overdue,
    assignedToYou,
    unreadNotifications
  })
}
