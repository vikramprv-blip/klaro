import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkItems } from "@/lib/services/work-items";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const assignedTo = searchParams.get("assignedTo");
    const filingType = searchParams.get("filingType");

    const items = await getWorkItems({
      status: (status as any) ?? undefined,
      clientId: clientId ?? undefined,
      assignedTo: assignedTo ?? undefined,
      filingType: filingType ?? undefined,
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch work items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    if (!body.clientId) {
      return NextResponse.json(
        { error: "Client is required" },
        { status: 400 }
      )
    }


    const itemCount = await prisma.workItem.count({
      where: {
        status: body.status ?? "PENDING",
      },
    });

    const item = await prisma.workItem.create({
      data: {
        title: body.title,
        description: body.description,
        filingType: body.filingType,
        periodLabel: body.periodLabel,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        priority: body.priority,
        status: body.status ?? "PENDING",
        position: body.position ?? itemCount,
        client: { connect: { id: body.clientId } },
        createdById: body.createdById,
      },
      include: {
        client: true,
        assignments: {
          where: { unassignedAt: null },
          include: { user: true },
        },
        documents: true,
        invoice: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create work item" },
      { status: 400 }
    );
  }
}
