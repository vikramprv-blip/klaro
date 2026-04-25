import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")
  const employeeId = searchParams.get("employeeId")
  const month = searchParams.get("month")

  const payroll = await prisma.payroll.findMany({
    where: {
      orgId: orgId || undefined,
      employeeId: employeeId || undefined,
      month: month || undefined
    },
    include: {
      employee: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return NextResponse.json(payroll)
}

export async function POST(req: Request) {
  const body = await req.json()

  const baseSalary = Number(body.baseSalary || 0)
  const deductions = Number(body.deductions || 0)
  const bonus = Number(body.bonus || 0)
  const netPay = baseSalary + bonus - deductions

  const payroll = await prisma.payroll.create({
    data: {
      orgId: body.orgId,
      employeeId: body.employeeId,
      month: body.month,
      baseSalary,
      deductions,
      bonus,
      netPay,
      status: body.status || "pending",
      paidAt: body.paidAt ? new Date(body.paidAt) : null,
      paymentMode: body.paymentMode
    }
  })

  return NextResponse.json(payroll)
}
