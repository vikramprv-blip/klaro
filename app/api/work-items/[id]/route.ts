import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkItemById } from "@/lib/services/work-items";
import { updateWorkItemSchema } from "@/lib/validations/work-item";

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
try {
    const body = await req.json();
    const parsed = updateWorkItemSchema.parse(body);

    const item = await prisma.workItem.update({
      where: { id: id },
      data: {
        ...parsed,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
      },
    });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json(
      { error: "Failed to update work item" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
try {
    await prisma.workItem.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete work item" },
      { status: 400 }
    );
  }
}
