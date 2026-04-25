import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.json()
  const orgId = body.orgId || "demo-org"

  const agg = await prisma.payroll.aggregate({
    where: { orgId },
    _sum: { netPay: true }
  })

  const total = agg._sum.netPay || 0

  // TEMP: just return value (no DB update yet)
  return NextResponse.json({ orgId, payrollCost: total })
}
