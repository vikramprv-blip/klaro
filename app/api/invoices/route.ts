import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/invoices → list invoices
export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

// POST /api/invoices → create invoice
export async function POST(req: Request) {
  const body = await req.json();

  const invoice = await prisma.invoice.create({
    data: {
      id: crypto.randomUUID(),
      number: body.number || `INV-${Date.now()}`,
      amount: Number(body.amount || 0),
      status: body.status || "draft",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      clientId: body.clientId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(invoice);
}
