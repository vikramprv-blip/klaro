import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      created_at: "asc",
    },
  })

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      name: null,
      email: user.email,
    })),
  })
}
