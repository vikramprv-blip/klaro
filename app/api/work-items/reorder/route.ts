export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items = Array.isArray(body?.items) ? body.items : []

    await prisma.$transaction(
      items.map((item: any) =>
        prisma.workItem.update({
          where: { id: item.id },
          data: {
            status: String(item.status),
          },
        })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("WORK_ITEMS_REORDER_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to reorder work items" },
      { status: 500 }
    )
  }
}
