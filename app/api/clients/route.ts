import { NextResponse } from "next/server"
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
