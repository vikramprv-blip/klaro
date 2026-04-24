import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(invoices);
  }

  if (req.method === "POST") {
    const body = req.body || {};

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

    return res.status(200).json(invoice);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
