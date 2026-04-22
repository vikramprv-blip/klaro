import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(docs)
}
