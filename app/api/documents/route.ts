import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const doc = await prisma.document.create({
      data: {
        filename: body.filename,
        content: body.content,
        clientId: body.clientId || null,
      },
    })

    return NextResponse.json({ ok: true, document: doc })
  } catch (e) {
    console.error("DOCUMENT_CREATE_ERROR", e)
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
  }
}
