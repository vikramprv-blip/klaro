import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId") || "demo-org"
    const employeeId = searchParams.get("employeeId")
    const month = searchParams.get("month")

    const payroll = await prisma.payroll.findMany({
      where: {
        orgId,
        ...(employeeId ? { employeeId } : {}),
        ...(month ? { month } : {})
      },
      include: { employee: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(payroll)
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.employeeId || !body.month) {
      return NextResponse.json({ error: "employeeId and month are required" }, { status: 400 })
    }

    const baseSalary = Number(body.baseSalary || 0)
    const deductions = Number(body.deductions || 0)
    const bonus = Number(body.bonus || 0)
    const netPay = baseSalary + bonus - deductions

    const payroll = await prisma.payroll.create({
      data: {
        orgId: body.orgId || "demo-org",
        employeeId: body.employeeId,
        month: body.month,
        baseSalary,
        deductions,
        bonus,
        netPay,
        status: body.status || "pending",
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
        paymentMode: body.paymentMode || null
      }
    })

    return NextResponse.json(payroll)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 })
  }
}
