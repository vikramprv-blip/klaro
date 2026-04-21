export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "./../../../../lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.status !== undefined) data.status = body.status;
    

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "No update payload supplied" }, { status: 400 });
    }

    const updated = await prisma.workItem.update({
      where: { id: id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("workboard PATCH failed", error);
    return NextResponse.json({ error: "Failed to update work item" }, { status: 500 });
  }
}
