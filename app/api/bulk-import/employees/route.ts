import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, orgId } = body;

    if (!Array.isArray(rows) || !rows.length) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    const results = { imported: 0, failed: 0, errors: [] as string[] };

    for (const row of rows) {
      const name = String(row.name || row.Name || row["Employee Name"] || "").trim();
      const email = String(row.email || row.Email || "").trim();

      if (!name || !email) {
        results.failed++;
        results.errors.push(`Skipped — missing name or email: ${JSON.stringify(row)}`);
        continue;
      }

      try {
        const employee = await prisma.employee.create({
          data: {
            name,
            email,
            phone: String(row.phone || row.Phone || row.Mobile || "").trim() || null,
            role: String(row.role || row.Role || row.Designation || "Staff").trim(),
            department: String(row.department || row.Department || "").trim() || null,
            salary: Number(row.salary || row.Salary || row.CTC || 0),
            status: "active",
            orgId: orgId || "demo-org",
          },
        });

        await prisma.leaveBalance.create({
          data: {
            orgId: orgId || "demo-org",
            employeeId: employee.id,
            casual: 12, sick: 12, earned: 15, holiday: 10,
            casualUsed: 0, sickUsed: 0, earnedUsed: 0,
            year: new Date().getFullYear(),
          },
        });

        results.imported++;
      } catch (e: any) {
        results.failed++;
        results.errors.push(`${name}: ${e.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
