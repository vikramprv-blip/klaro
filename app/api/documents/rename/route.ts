import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { id, filename } = await req.json()

  if (!id || !filename) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const doc = await prisma.document.update({
    where: { id },
    data: { filename },
  })

  return NextResponse.json({ document: doc })
}
