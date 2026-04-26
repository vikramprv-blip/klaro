import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || "demo-org";
  const employeeId = searchParams.get("employeeId");
  const status = searchParams.get("status");

  const requests = await prisma.leaveRequest.findMany({
    where: {
      orgId,
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
    },
    include: { employee: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, employeeId, leaveType, fromDate, toDate, days, reason } = body;

    if (!employeeId || !leaveType || !fromDate || !toDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.leaveRequest.create({
      data: {
        orgId: orgId || "demo-org",
        employeeId,
        leaveType,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        days: Number(days || 1),
        reason: reason || null,
        status: "pending",
      },
    });

    return NextResponse.json(request);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, approvedBy } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        ...(status === "approved" ? {
          approvedBy: approvedBy || "admin",
          approvedAt: new Date(),
        } : {}),
        ...(status === "rejected" ? {
          rejectedBy: approvedBy || "admin",
          rejectedAt: new Date(),
        } : {}),
      },
    });

    return NextResponse.json(request);
  } catch (e) {
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}
