import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const templates = await prisma.serviceTemplate.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("SERVICE_TEMPLATES_GET_ERROR", error)
    return NextResponse.json({ error: "Failed to load service templates" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const name = String(body.name || "").trim()
    const code = body.code ? String(body.code).trim() : null
    const description = body.description ? String(body.description).trim() : null
    const department = body.department ? String(body.department).trim() : null
    const frequency = String(body.frequency || "ONCE").toUpperCase()
    const dueDayOfMonth = body.dueDayOfMonth ? Number(body.dueDayOfMonth) : null
    const dueMonthOfYear = body.dueMonthOfYear ? Number(body.dueMonthOfYear) : null
    const isActive = body.isActive === false ? false : true

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const allowed = ["ONCE", "MONTHLY", "QUARTERLY", "YEARLY"]
    if (!allowed.includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    }

    const created = await prisma.serviceTemplate.create({
      data: {
        name,
        code,
        description,
        department,
        frequency: frequency as "ONCE" | "MONTHLY" | "QUARTERLY" | "YEARLY",
        dueDayOfMonth,
        dueMonthOfYear,
        isActive,
      },
    })

    return NextResponse.json({ template: created }, { status: 201 })
  } catch (error) {
    console.error("SERVICE_TEMPLATES_POST_ERROR", error)
    return NextResponse.json({ error: "Failed to create service template" }, { status: 500 })
  }
}
