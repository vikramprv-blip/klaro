export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function POST(_: Request, { params }: Params) {
  try {
    const { id } = await params

    const item = await prisma.workItem.findUnique({
      where: { id },
      include: { client: true },
    })

    if (!item) {
      return NextResponse.json({ error: "Work item not found" }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      item,
      message: "Restore is a no-op because archivedAt is not in the current schema",
    })
  } catch (error) {
    console.error("WORKBOARD_RESTORE_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to restore work item" },
      { status: 500 }
    )
  }
}
