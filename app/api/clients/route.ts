import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("failed to fetch clients", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body?.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("failed to create client", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
