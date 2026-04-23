import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { id, file_name } = await req.json()

  if (!id || !file_name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const doc = await prisma.documents.update({
    where: { id },
    data: { file_name },
  })

  return NextResponse.json({ document: doc })
}
