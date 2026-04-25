export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.ca_invoices.findMany({
    select: {
      status: true,
      total_amount: true,
      due_date: true,
    },
  });

  const now = new Date();

  const summary = invoices.reduce(
    (acc, inv) => {
      const total = Number(inv.total_amount || 0);
      const status = String(inv.status || "").toLowerCase();

      acc.totalInvoices += 1;
      acc.totalAmount += total;

      if (status === "paid") {
        acc.paidInvoices += 1;
        acc.paidAmount += total;
      } else {
        acc.unpaidInvoices += 1;
        acc.unpaidAmount += total;
      }

      if (status !== "paid" && inv.due_date && new Date(inv.due_date) < now) {
        acc.overdueInvoices += 1;
        acc.overdueAmount += total;
      }

      return acc;
    },
    {
      totalInvoices: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      overdueInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      overdueAmount: 0,
    }
  );

  return NextResponse.json(summary);
}
