import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")
  const employeeId = searchParams.get("employeeId")

  const attendance = await prisma.attendance.findMany({
    where: {
      orgId: orgId || undefined,
      employeeId: employeeId || undefined
    },
    include: {
      employee: true
    },
    orderBy: {
      date: "desc"
    }
  })

  return NextResponse.json(attendance)
}

export async function POST(req: Request) {
  const body = await req.json()

  const attendance = await prisma.attendance.create({
    data: {
      orgId: body.orgId,
      employeeId: body.employeeId,
      date: new Date(body.date),
      checkIn: body.checkIn ? new Date(body.checkIn) : null,
      checkOut: body.checkOut ? new Date(body.checkOut) : null,
      status: body.status || "present",
      notes: body.notes
    }
  })

  return NextResponse.json(attendance)
}
