export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const overdue = await prisma.ca_invoices.findMany({
    where: {
      status: { not: "paid" },
      due_date: { lt: new Date() },
    },
    include: {
      ca_clients: {
        select: {
          name: true,
          phone: true,
          email: true,
        },
      },
    },
    orderBy: { due_date: "asc" },
  });

  return NextResponse.json({
    ok: true,
    count: overdue.length,
    invoices: overdue.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      clientName: inv.ca_clients?.name || "Unknown",
      phone: inv.ca_clients?.phone || null,
      email: inv.ca_clients?.email || null,
      amount: Number(inv.total_amount || 0),
      dueDate: inv.due_date,
      canSendWhatsApp: Boolean(inv.ca_clients?.phone),
    })),
  });
}
