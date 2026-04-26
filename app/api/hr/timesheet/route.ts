import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || "demo-org";
  const employeeId = searchParams.get("employeeId");
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const entries = await prisma.timeEntry.findMany({
    where: {
      orgId,
      ...(employeeId ? { employeeId } : {}),
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
      ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
    },
    include: { employee: { select: { name: true, role: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orgId,
      employeeId,
      clientId,
      clientName,
      serviceType,
      description,
      date,
      hours,
      ratePerHour,
      billable,
    } = body;

    if (!employeeId || !date || !hours) {
      return NextResponse.json({ error: "employeeId, date and hours required" }, { status: 400 });
    }

    const entry = await prisma.timeEntry.create({
      data: {
        orgId: orgId || "demo-org",
        employeeId,
        clientId: clientId || null,
        clientName: clientName || null,
        serviceType: serviceType || null,
        description: description || null,
        date: new Date(date),
        hours: Number(hours),
        ratePerHour: Number(ratePerHour || 0),
        billable: billable !== false,
        status: "draft",
      },
    });

    return NextResponse.json(entry);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, approvedBy } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        status,
        ...(status === "approved" ? {
          approvedBy: approvedBy || "admin",
          approvedAt: new Date(),
        } : {}),
      },
    });

    return NextResponse.json(entry);
  } catch (e) {
    return NextResponse.json({ error: "Failed to update time entry" }, { status: 500 });
  }
}
