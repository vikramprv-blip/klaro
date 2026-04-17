import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    const [
      total,
      pending,
      inProgress,
      done,
      overdueItems,
      recentItems,
      highPriority,
      urgent,
    ] = await Promise.all([
      prisma.workItem.count({
        where: { archivedAt: null },
      }),
      prisma.workItem.count({
        where: { archivedAt: null, status: "PENDING" as any },
      }),
      prisma.workItem.count({
        where: { archivedAt: null, status: "IN_PROGRESS" as any },
      }),
      prisma.workItem.count({
        where: { archivedAt: null, status: "DONE" as any },
      }),
      prisma.workItem.findMany({
        where: {
          archivedAt: null,
          dueDate: { lt: now },
          status: { not: "DONE" as any },
        },
        include: {
          client: true,
        },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.workItem.findMany({
        where: {
          archivedAt: null,
        },
        include: {
          client: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.workItem.count({
        where: { archivedAt: null, priority: "HIGH" as any },
      }),
      prisma.workItem.count({
        where: { archivedAt: null, priority: "URGENT" as any },
      }),
    ])

    return NextResponse.json({
      metrics: {
        total,
        pending,
        inProgress,
        done,
        overdue: overdueItems.length,
        highPriority,
        urgent,
      },
      overdueItems,
      workItems: recentItems,
    })
  } catch (error) {
    console.error("dashboard metrics failed", error)
    return NextResponse.json({
      metrics: {
        total: 0,
        pending: 0,
        inProgress: 0,
        done: 0,
        overdue: 0,
        highPriority: 0,
        urgent: 0,
      },
      overdueItems: [],
      workItems: [],
    })
  }
}
