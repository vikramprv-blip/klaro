import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params

    const activity = await prisma.workItemActivity.findMany({
      where: { workItemId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error("GET /api/workboard/[id]/activity failed", error)
    return NextResponse.json(
      { error: "Failed to fetch work item activity" },
      { status: 500 },
    )
  }
}
