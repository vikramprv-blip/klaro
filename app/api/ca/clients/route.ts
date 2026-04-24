import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gstin: true,
    },
  });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.name || !String(body.name).trim()) {
      return NextResponse.json({ ok: false, error: "Client name is required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name: String(body.name).trim(),
        email: body.email ? String(body.email).trim() : null,
        phone: body.phone ? String(body.phone).trim() : null,
        gstin: body.gstin ? String(body.gstin).trim() : null,
      },
    });

    const templates = [
      {
        title: `Collect documents from ${client.name}`,
        description: "Request PAN, GSTIN, bank details, prior returns, and current-period documents.",
        status: "todo",
        priority: "medium",
      },
      {
        title: `Review GST compliance for ${client.name}`,
        description: "Check GST registration, filing frequency, pending returns, and upcoming deadlines.",
        status: "todo",
        priority: "high",
      },
      {
        title: `Prepare ITR checklist for ${client.name}`,
        description: "Create income tax checklist and identify missing information before filing season.",
        status: "todo",
        priority: "medium",
      },
    ];

    await prisma.workItem.createMany({
      data: templates.map((task) => ({
        ...task,
        clientId: client.id,
      })),
    });

    return NextResponse.json({ ok: true, client });
  } catch (e) {
    console.error("POST /api/ca/clients failed:", e);
    return NextResponse.json({ ok: false, error: "Failed to create client" }, { status: 500 });
  }
}
