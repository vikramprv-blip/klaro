import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("GET /api/users failed", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
