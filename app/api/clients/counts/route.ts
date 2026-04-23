import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const docs = await prisma.documents.groupBy({
    by: ["client_id"],
    _count: { _all: true },
  })

  const counts = Object.fromEntries(
    docs
      .filter((d) => d.client_id)
      .map((d) => [d.client_id as string, d._count._all])
  )

  return NextResponse.json(counts)
}
