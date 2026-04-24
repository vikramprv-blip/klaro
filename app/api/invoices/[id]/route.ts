import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
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
  const { id } = await params;
  const body = await req.json();

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(body.number !== undefined ? { number: body.number } : {}),
      ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.dueDate !== undefined
        ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
        : {}),
      ...(body.clientId !== undefined ? { clientId: body.clientId || null } : {}),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.invoice.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
