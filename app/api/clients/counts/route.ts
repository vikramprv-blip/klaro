import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const docs = await prisma.document.groupBy({
    by: ["clientId"],
    _count: { _all: true },
  })

  const counts = Object.fromEntries(
    docs
      .filter((d) => d.clientId)
      .map((d) => [d.clientId as string, d._count._all])
  )

  return NextResponse.json(counts)
}
