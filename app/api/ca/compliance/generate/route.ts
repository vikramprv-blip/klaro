import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function monthName(month: number) {
  return new Date(2026, month - 1, 1).toLocaleString("en-IN", { month: "short" });
}
function gstDueDate(year: number, month: number) {
  const nextMonth = month === 12 ? 1 : month + 1;
  const dueYear = month === 12 ? year + 1 : year;
  return `${dueYear}-${String(nextMonth).padStart(2, "0")}-20`;
}
function tdsDueDate(year: number, quarter: number) {
  if (quarter === 1) return `${year}-07-31`;
  if (quarter === 2) return `${year}-10-31`;
  if (quarter === 3) return `${year + 1}-01-31`;
  return `${year + 1}-05-31`;
}
function itrDueDate(year: number) {
  return `${year}-07-31`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const year = Number(body?.year || new Date().getFullYear());
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, gstin: true },
      orderBy: { createdAt: "desc" },
    });
    let created = 0;
    for (const client of clients) {
      for (let month = 1; month <= 12; month++) {
        const period = `${monthName(month)} ${year}`;
        const title = `GST filing for ${client.name} - ${period}`;
        await prisma.$queryRawUnsafe(
          `INSERT INTO ca_compliance_tasks
           (client_id, client_name, task_type, title, description, period, due_date, status, priority, source)
           VALUES ($1, $2, 'gst', $3, 'Prepare and file monthly GST return.', $4, $5::date, 'pending', 'high', 'auto')
           ON CONFLICT (client_id, task_type, period) DO NOTHING`,
          client.id, client.name, title, period, gstDueDate(year, month)
        );
        created++;
      }
      for (let quarter = 1; quarter <= 4; quarter++) {
        const period = `Q${quarter} ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
        const title = `TDS compliance for ${client.name} - ${period}`;
        await prisma.$queryRawUnsafe(
          `INSERT INTO ca_compliance_tasks
           (client_id, client_name, task_type, title, description, period, due_date, status, priority, source)
           VALUES ($1, $2, 'tds', $3, 'Review challans and prepare quarterly TDS filing.', $4, $5::date, 'pending', 'high', 'auto')
           ON CONFLICT (client_id, task_type, period) DO NOTHING`,
          client.id, client.name, title, period, tdsDueDate(year, quarter)
        );
        created++;
      }
      const itrPeriod = `AY ${year + 1}-${String((year + 2) % 100).padStart(2, "0")}`;
      const itrTitle = `ITR filing for ${client.name} - ${itrPeriod}`;
      await prisma.$queryRawUnsafe(
        `INSERT INTO ca_compliance_tasks
         (client_id, client_name, task_type, title, description, period, due_date, status, priority, source)
         VALUES ($1, $2, 'itr', $3, 'Collect documents and prepare income tax return.', $4, $5::date, 'pending', 'medium', 'auto')
         ON CONFLICT (client_id, task_type, period) DO NOTHING`,
        client.id, client.name, itrTitle, itrPeriod, itrDueDate(year + 1)
      );
      created++;
    }
    return NextResponse.json({ ok: true, clients: clients.length, attempted: created });
  } catch (error) {
    console.error("POST /api/ca/compliance/generate failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to generate compliance tasks" }, { status: 500 });
  }
}
