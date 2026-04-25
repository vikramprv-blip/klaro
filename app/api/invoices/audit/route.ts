export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.ca_invoices.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    include: {
      ca_clients: {
        select: {
          name: true,
          email: true,
          gstin: true,
        },
      },
    },
  });

  const audit = invoices.map((inv) => {
    const amount = Number(inv.total_amount || 0);
    const isLarge = amount >= 100000;
    const isOverdue =
      inv.status !== "paid" &&
      inv.due_date !== null &&
      new Date(inv.due_date) < new Date();
    const missingClient = !inv.client_id;
    const missingGst = !inv.ca_clients?.gstin;

    const risks = [
      isLarge ? "HIGH_VALUE_INVOICE" : null,
      isOverdue ? "OVERDUE_PAYMENT" : null,
      missingClient ? "MISSING_CLIENT_LINK" : null,
      missingGst ? "CLIENT_GSTIN_MISSING" : null,
    ].filter(Boolean);

    return {
      invoiceId: inv.id,
      invoiceNumber: inv.invoice_number,
      client: inv.ca_clients?.name || "Unknown",
      amount,
      status: inv.status,
      dueDate: inv.due_date,
      risks,
      riskLevel: risks.length >= 2 ? "HIGH" : risks.length === 1 ? "MEDIUM" : "LOW",
    };
  });

  return NextResponse.json({ ok: true, audit });
}
