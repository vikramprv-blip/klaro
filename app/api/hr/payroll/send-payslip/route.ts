import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp, formatPayslipMessage } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payrollId, orgId } = body;

    if (!payrollId) {
      return NextResponse.json({ error: "payrollId required" }, { status: 400 });
    }

    // Get payroll record with employee
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: { employee: true },
    });

    if (!payroll) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    const phone = payroll.employee.phone;
    if (!phone) {
      return NextResponse.json({ error: "Employee has no phone number" }, { status: 400 });
    }

    // Get company name
    const settings = await prisma.companySettings.findFirst({
      where: { userId: orgId || "" },
    });
    const companyName = settings?.companyName || "Your Company";

    // Format payslip message
    const message = formatPayslipMessage({
      employeeName: payroll.employee.name,
      month: payroll.month,
      grossSalary: payroll.baseSalary + payroll.bonus,
      pf: Math.round(Math.min(payroll.baseSalary, 15000) * 0.12),
      esic: payroll.baseSalary <= 21000 ? Math.round(payroll.baseSalary * 0.0075) : 0,
      pt: payroll.baseSalary > 10000 ? 200 : payroll.baseSalary > 7500 ? 175 : 0,
      tds: 0, // Simplified
      totalDeductions: payroll.deductions,
      netPay: payroll.netPay,
      companyName,
    });

    const result = await sendWhatsApp(phone, message);

    if (result.ok) {
      return NextResponse.json({ ok: true, sid: result.sid, phone });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
