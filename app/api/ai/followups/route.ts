import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateFollowups } from "@/lib/ai/generate-followups"

export async function POST(req: NextRequest) {
  const { workItemId } = await req.json()

  const item = await prisma.workItem.findUnique({
    where: { id: workItemId },
  })

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const followups = await generateFollowups({
    title: item.title,
    description: item.description,
  })

  return NextResponse.json({ followups })
}
