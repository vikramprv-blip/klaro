import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const doc = await prisma.documents.findUnique({
    where: { id },
  })

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(doc)
}
