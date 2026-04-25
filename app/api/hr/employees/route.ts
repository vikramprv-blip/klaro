import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(employees)
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const employee = await prisma.employee.create({
      data: {
        orgId: body.orgId || "demo-org",
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        role: body.role || "staff",
        department: body.department || null,
        salary: Number(body.salary || 0)
      }
    })

    return NextResponse.json(employee)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
