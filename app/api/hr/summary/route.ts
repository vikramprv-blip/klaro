import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [employees, attendance, payroll] = await Promise.all([
    prisma.employee.count(),
    prisma.attendance.count(),
    prisma.payroll.aggregate({
      _sum: { netPay: true }
    })
  ])

  return NextResponse.json({
    totalEmployees: employees,
    totalAttendanceRecords: attendance,
    totalPayroll: payroll._sum.netPay || 0
  })
}
