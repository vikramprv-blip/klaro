import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId")
  const q = req.nextUrl.searchParams.get("q")?.trim()

  const docs = await prisma.document.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(q
        ? {
            filename: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(docs)
}
