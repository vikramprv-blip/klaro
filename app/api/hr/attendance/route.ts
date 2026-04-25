import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId") || "demo-org"
    const employeeId = searchParams.get("employeeId")

    const attendance = await prisma.attendance.findMany({
      where: {
        orgId,
        ...(employeeId ? { employeeId } : {})
      },
      include: { employee: true },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(attendance)
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.employeeId || !body.date) {
      return NextResponse.json({ error: "employeeId and date are required" }, { status: 400 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        orgId: body.orgId || "demo-org",
        employeeId: body.employeeId,
        date: new Date(body.date),
        checkIn: body.checkIn ? new Date(body.checkIn) : null,
        checkOut: body.checkOut ? new Date(body.checkOut) : null,
        status: body.status || "present",
        notes: body.notes || null
      }
    })

    return NextResponse.json(attendance)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 })
  }
}
