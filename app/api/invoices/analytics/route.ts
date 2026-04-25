export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.ca_invoices.findMany({
    select: {
      total_amount: true,
      created_at: true,
      paid_date: true,
      status: true,
    },
  });

  const months: Record<string, { month: string; invoiced: number; collected: number }> = {};

  for (const inv of invoices) {
    const created = inv.created_at ? new Date(inv.created_at) : null;
    const paid = inv.paid_date ? new Date(inv.paid_date) : null;

    if (created) {
      const key = `${created.getFullYear()}-${created.getMonth() + 1}`;
      if (!months[key]) {
        months[key] = {
          month: key,
          invoiced: 0,
          collected: 0,
        };
      }
      months[key].invoiced += Number(inv.total_amount || 0);
    }

    if (paid && inv.status === "paid") {
      const key = `${paid.getFullYear()}-${paid.getMonth() + 1}`;
      if (!months[key]) {
        months[key] = {
          month: key,
          invoiced: 0,
          collected: 0,
        };
      }
      months[key].collected += Number(inv.total_amount || 0);
    }
  }

  return NextResponse.json(
    Object.values(months).sort((a, b) => a.month.localeCompare(b.month))
  );
}
