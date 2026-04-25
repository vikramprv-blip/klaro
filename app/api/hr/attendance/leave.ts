import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.employeeId || !body.from || !body.to) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const start = new Date(body.from)
    const end = new Date(body.to)

    const days = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }

    const records = await Promise.all(
      days.map(date =>
        prisma.attendance.create({
          data: {
            orgId: body.orgId || "demo-org",
            employeeId: body.employeeId,
            date,
            status: "leave",
            notes: body.reason || "Leave"
          }
        })
      )
    )

    return NextResponse.json({ count: records.length })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create leave" }, { status: 500 })
  }
}
