import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")

  const employees = await prisma.employee.findMany({
    where: { orgId: orgId || undefined },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(employees)
}

export async function POST(req: Request) {
  const body = await req.json()

  const employee = await prisma.employee.create({
    data: {
      orgId: body.orgId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      department: body.department,
      salary: body.salary
    }
  })

  return NextResponse.json(employee)
}
