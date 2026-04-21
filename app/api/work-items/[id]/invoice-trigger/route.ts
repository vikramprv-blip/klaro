export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const workItem = await prisma.workItem.findUnique({ where: { id } })
    if (!workItem) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, workItem })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
