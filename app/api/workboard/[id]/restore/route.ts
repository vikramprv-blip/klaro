import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params

    const restored = await prisma.workItem.update({
      where: { id },
      data: {
        archivedAt: null,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(restored)
  } catch (error) {
    console.error("POST /api/workboard/[id]/restore failed", error)
    return NextResponse.json(
      { error: "Failed to restore work item" },
      { status: 500 },
    )
  }
}
