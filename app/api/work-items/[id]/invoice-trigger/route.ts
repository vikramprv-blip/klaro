export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function invoiceNumber() {
  return `INV-${Date.now()}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const workItem = await prisma.workItem.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!workItem) {
      return NextResponse.json({ ok: false, error: "Work item not found" }, { status: 404 });
    }

    const amount = Number(body.amount || 0);
    const gstRate = Number(body.gst_rate ?? 18);
    const gstAmount = Number(((amount * gstRate) / 100).toFixed(2));
    const totalAmount = Number((amount + gstAmount).toFixed(2));

    const invoice = await prisma.ca_invoices.create({
      data: {
        invoice_number: body.invoice_number || invoiceNumber(),
        client_id: workItem.clientId || null,
        service_type: body.service_type || workItem.title || "Professional Services",
        amount,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        currency: "INR",
        status: "draft",
        due_date: body.due_date ? new Date(body.due_date) : null,
        payment_method: body.payment_method || null,
        notes: body.notes || `Generated from work item: ${workItem.title}`,
        region_code: "IN",
      },
    });

    return NextResponse.json({ ok: true, invoice, workItem });
  } catch (error) {
    console.error("POST /api/work-items/[id]/invoice-trigger failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to create invoice from work item" }, { status: 500 });
  }
}
