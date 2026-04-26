import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const str = String(val).replace(/"/g, '""');
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str}"` : str;
      }).join(",")
    )
  ];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "clients";

  const org = await prisma.organization.findFirst({ where: { userId: user.id } });
  const orgId = org?.id || "demo-org";

  let data: Record<string, any>[] = [];
  let filename = `klaro-${type}`;

  try {
    switch (type) {
      case "clients":
        data = await prisma.client.findMany({
          where: { organizationId: orgId },
          select: { id: true, name: true, email: true, phone: true, gstin: true, address: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "invoices":
        data = (await prisma.ca_invoices.findMany({
          orderBy: { created_at: "desc" },
          take: 1000,
        })).map(i => ({
          invoice_number: i.invoice_number,
          amount: i.amount,
          gst_amount: i.gst_amount,
          total_amount: i.total_amount,
          status: i.status,
          due_date: i.due_date,
          paid_date: i.paid_date,
          payment_method: i.payment_method,
          created_at: i.created_at,
        }));
        break;

      case "employees":
        data = await prisma.employee.findMany({
          where: { orgId },
          select: { id: true, name: true, email: true, phone: true, role: true, department: true, salary: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "timesheets":
        data = (await prisma.timeEntry.findMany({
          where: { orgId },
          include: { employee: { select: { name: true } } },
          orderBy: { date: "desc" },
          take: 1000,
        })).map(t => ({
          date: t.date,
          employee: t.employee.name,
          client: t.clientName,
          service: t.serviceType,
          description: t.description,
          hours: t.hours,
          rate_per_hour: t.ratePerHour,
          amount: t.hours * t.ratePerHour,
          billable: t.billable,
          billed: t.billed,
          status: t.status,
        }));
        break;

      case "gst":
        data = (await prisma.gst_filings.findMany({
          orderBy: { created_at: "desc" },
          take: 1000,
        })).map(g => ({
          gstin: g.gstin,
          return_type: g.return_type,
          period: g.period,
          due_date: g.due_date,
          filed_date: g.filed_date,
          status: g.status,
          late_fee: g.late_fee,
          tax_liability: g.tax_liability,
        }));
        break;

      case "tds":
        data = (await prisma.tds_filings.findMany({
          orderBy: { created_at: "desc" },
          take: 1000,
        })).map(t => ({
          form_type: t.form_type,
          quarter: t.quarter,
          due_date: t.due_date,
          filed_date: t.filed_date,
          status: t.status,
          tds_amount: t.tds_amount,
          late_fee: t.late_fee,
        }));
        break;

      case "documents":
        data = (await prisma.documents.findMany({
          orderBy: { created_at: "desc" },
          take: 1000,
        })).map(d => ({
          title: d.title,
          file_name: d.file_name,
          file_type: d.file_type,
          doc_category: d.doc_category,
          file_url: d.file_url,
          created_at: d.created_at,
        }));
        break;

      case "deadlines":
        data = (await prisma.compliance_deadlines.findMany({
          orderBy: { due_date: "asc" },
        })).map(d => ({
          title: d.title,
          deadline_type: d.deadline_type,
          due_date: d.due_date,
          status: d.status,
          penalty_info: d.penalty_info,
          financial_year: d.financial_year,
        }));
        break;

      case "all":
        // Full account export
        const [clients, invoices, employees, gstFilings, tdsFilings, docs] = await Promise.all([
          prisma.client.findMany({ where: { organizationId: orgId } }),
          prisma.ca_invoices.findMany({ take: 1000 }),
          prisma.employee.findMany({ where: { orgId } }),
          prisma.gst_filings.findMany({ take: 500 }),
          prisma.tds_filings.findMany({ take: 500 }),
          prisma.documents.findMany({ take: 500 }),
        ]);

        // Return as JSON for full export
        return new NextResponse(
          JSON.stringify({ clients, invoices, employees, gstFilings, tdsFilings, docs }, null, 2),
          {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": `attachment; filename="klaro-full-export-${new Date().toISOString().split("T")[0]}.json"`,
            },
          }
        );

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    const csv = toCSV(data.map(row => {
      const flat: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        flat[k] = v instanceof Date ? v.toISOString().split("T")[0] : v;
      }
      return flat;
    }));

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
