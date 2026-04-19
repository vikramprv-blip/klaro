import { NextRequest, NextResponse } from "next/server";
import { assignWorkItemSchema } from "@/lib/validations/work-item";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = assignWorkItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid assignment payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      workItemId: id,
      assignment: parsed.data,
      message: "Assignment system is not available in the current schema",
    });
  } catch (error) {
    console.error("WORK_ITEM_ASSIGN_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to process assignment request" },
      { status: 500 }
    );
  }
}
