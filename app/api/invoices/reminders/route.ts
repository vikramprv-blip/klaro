export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const overdue = await prisma.ca_invoices.findMany({
    where: {
      status: {
        not: "paid",
      },
      due_date: {
        lt: new Date(),
      },
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
  });

  const queued = [];

  for (const inv of overdue) {
    const phone = inv.ca_clients?.phone;
    if (!phone) continue;

    const reminder = await prisma.whatsappOutbox.create({
      data: {
        toPhone: phone,
        templateName: "invoice_payment_reminder",
        templateLang: "en",
        payload: {
          invoiceId: inv.id,
          invoiceNumber: inv.invoice_number,
          clientName: inv.ca_clients?.name,
          amount: Number(inv.total_amount || 0),
          dueDate: inv.due_date,
        },
      },
    });

    queued.push(reminder);
  }

  return NextResponse.json({
    ok: true,
    overdueFound: overdue.length,
    remindersQueued: queued.length,
    queued,
  });
}
