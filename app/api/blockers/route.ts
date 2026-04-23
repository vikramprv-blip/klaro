import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function extractBlocker(description: string | null) {
  if (!description) return null

  const match = description.match(/Blockers:\s*([\s\S]*?)(?:\n\n|$)/i)
  if (!match) return null

  const blocker = match[1]?.trim()
  return blocker || null
}

export async function GET(req: NextRequest) {
  try {
    const urgentOnly = req.nextUrl.searchParams.get("urgent") === "true"

    const items = await prisma.workItem.findMany({
      where: {
        description: {
          contains: "Blockers:",
          mode: "insensitive",
        },
        ...(urgentOnly ? { priority: "HIGH" } : {}),
      },
      include: {
        client: true,
      },
      orderBy: [
        { priority: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      take: 200,
    })

    const blockers = items.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      client: item.client,
      blocker: extractBlocker(item.description),
      description: item.description,
      ageDays: Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      ),
    }))

    return NextResponse.json({ blockers })
  } catch (error) {
    console.error("blockers route error", error)
    return NextResponse.json({ error: "Failed to load blockers" }, { status: 500 })
  }
}
