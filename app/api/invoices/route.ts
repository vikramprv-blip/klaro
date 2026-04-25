export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function invoiceNumber() {
  return `INV-${Date.now()}`;
}

export async function GET() {
  const invoices = await prisma.ca_invoices.findMany({
    orderBy: { created_at: "desc" },
    include: {
      ca_clients: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          gstin: true,
        },
      },
    },
  });

  const normalized = invoices.map((inv) => ({
    ...inv,
    isOverdue:
      inv.status !== "paid" &&
      inv.due_date !== null &&
      new Date(inv.due_date) < new Date(),
  }));

  return NextResponse.json(normalized);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = Number(body.amount || 0);
    const gstRate = Number(body.gst_rate ?? 18);
    const gstAmount = Number(((amount * gstRate) / 100).toFixed(2));
    const totalAmount = Number((amount + gstAmount).toFixed(2));

    const invoice = await prisma.ca_invoices.create({
      data: {
        invoice_number: body.invoice_number || invoiceNumber(),
        client_id: body.client_id || null,
        merchant_id: body.merchant_id || null,
        service_type: body.service_type || "Professional Services",
        amount,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        currency: body.currency || "INR",
        status: body.status || "draft",
        due_date: body.due_date ? new Date(body.due_date) : null,
        payment_method: body.payment_method || null,
        upi_link: body.upi_link || null,
        notes: body.notes || null,
        region_code: body.region_code || "IN",
      },
    });

    return NextResponse.json({ ok: true, invoice });
  } catch (e) {
    console.error("POST /api/invoices failed:", e);
    return NextResponse.json({ ok: false, error: "Failed to create invoice" }, { status: 500 });
  }
}
