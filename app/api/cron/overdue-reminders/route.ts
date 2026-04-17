import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    const overdueItems = await prisma.workItem.findMany({
      where: {
        archivedAt: null,
        dueDate: { lt: now },
        status: { not: "DONE" as any },
      },
      include: {
        client: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    })

    let created = 0

    for (const item of overdueItems) {
      for (const assignment of item.assignments) {
        const title = `Overdue: ${item.title}`
        const body = `${item.client?.name || "No client"} · due ${item.dueDate?.toLocaleDateString() || "unknown"}`

        await prisma.notification.create({
          data: {
            userId: assignment.userId,
            title,
            body,
          },
        })

        created += 1
      }
    }

    return NextResponse.json({
      success: true,
      overdueItems: overdueItems.length,
      notificationsCreated: created,
    })
  } catch (error) {
    console.error("cron overdue reminders failed", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
