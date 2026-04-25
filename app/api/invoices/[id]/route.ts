export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.ca_invoices.findUnique({
    where: { id },
    include: {
      ca_clients: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const amount = body.amount !== undefined ? Number(body.amount) : undefined;
    const gstRate = body.gst_rate !== undefined ? Number(body.gst_rate) : undefined;

    let totals = {};

    if (amount !== undefined || gstRate !== undefined) {
      const existing = await prisma.ca_invoices.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const nextAmount = amount ?? Number(existing.amount);
      const nextGstRate = gstRate ?? Number(existing.gst_rate ?? 18);
      const gstAmount = Number(((nextAmount * nextGstRate) / 100).toFixed(2));
      const totalAmount = Number((nextAmount + gstAmount).toFixed(2));

      totals = {
        amount: nextAmount,
        gst_rate: nextGstRate,
        gst_amount: gstAmount,
        total_amount: totalAmount,
      };
    }

    const invoice = await prisma.ca_invoices.update({
      where: { id },
      data: {
        ...totals,
        ...(body.invoice_number !== undefined ? { invoice_number: body.invoice_number } : {}),
        ...(body.client_id !== undefined ? { client_id: body.client_id || null } : {}),
        ...(body.merchant_id !== undefined ? { merchant_id: body.merchant_id || null } : {}),
        ...(body.service_type !== undefined ? { service_type: body.service_type || null } : {}),
        ...(body.currency !== undefined ? { currency: body.currency || "INR" } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.due_date !== undefined ? { due_date: body.due_date ? new Date(body.due_date) : null } : {}),
        ...(body.paid_date !== undefined ? { paid_date: body.paid_date ? new Date(body.paid_date) : null } : {}),
        ...(body.payment_method !== undefined ? { payment_method: body.payment_method || null } : {}),
        ...(body.upi_link !== undefined ? { upi_link: body.upi_link || null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
        ...(body.region_code !== undefined ? { region_code: body.region_code || "IN" } : {}),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ ok: true, invoice });
  } catch (e) {
    console.error("PATCH /api/invoices/[id] failed:", e);
    return NextResponse.json({ ok: false, error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.ca_invoices.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
