import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, clientId, clientName, entryIds } = body;

    if (!clientId || !entryIds?.length) {
      return NextResponse.json({ error: "clientId and entryIds required" }, { status: 400 });
    }

    const entries = await prisma.timeEntry.findMany({
      where: {
        id: { in: entryIds },
        clientId,
        billed: false,
        status: "approved",
      },
      include: { employee: { select: { name: true } } },
    });

    if (!entries.length) {
      return NextResponse.json({ error: "No approved unbilled entries found" }, { status: 400 });
    }

    const subtotal = entries.reduce((sum, e) => sum + e.hours * e.ratePerHour, 0);
    const gstAmount = subtotal * 0.18;
    const total = subtotal + gstAmount;

    const count = await prisma.ca_invoices.count();
    const invoiceNumber = `INV-TS-${String(count + 1).padStart(4, "0")}`;

    const invoice = await prisma.ca_invoices.create({
      data: {
        invoice_number: invoiceNumber,
        amount: subtotal,
        gst_amount: gstAmount,
        total_amount: total,
        status: "draft",
        notes: `Timesheet invoice for ${clientName} — ${entries.length} entries`,
      },
    });

    await prisma.timeEntry.updateMany({
      where: { id: { in: entryIds } },
      data: { billed: true, invoiceId: invoice.id },
    });

    return NextResponse.json({
      ok: true,
      invoice,
      entriesCount: entries.length,
      subtotal,
      gstAmount,
      total,
    });
  } catch (e) {
    console.error("timesheet invoice error", e);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
