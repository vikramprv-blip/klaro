import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const payroll = await prisma.payroll.findUnique({
    where: { id: params.id },
    include: {
      employee: true
    }
  })

  return NextResponse.json(payroll)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()

  const baseSalary = body.baseSalary !== undefined ? Number(body.baseSalary) : undefined
  const deductions = body.deductions !== undefined ? Number(body.deductions) : undefined
  const bonus = body.bonus !== undefined ? Number(body.bonus) : undefined

  const existing = await prisma.payroll.findUnique({
    where: { id: params.id }
  })

  const nextBaseSalary = baseSalary ?? existing?.baseSalary ?? 0
  const nextDeductions = deductions ?? existing?.deductions ?? 0
  const nextBonus = bonus ?? existing?.bonus ?? 0

  const payroll = await prisma.payroll.update({
    where: { id: params.id },
    data: {
      month: body.month,
      baseSalary,
      deductions,
      bonus,
      netPay: nextBaseSalary + nextBonus - nextDeductions,
      status: body.status,
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
      paymentMode: body.paymentMode
    }
  })

  return NextResponse.json(payroll)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.payroll.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
