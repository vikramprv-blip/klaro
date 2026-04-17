import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ReorderItem = {
  id: string;
  status: string;
};

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const items = (body?.items ?? []) as ReorderItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items supplied" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.workItem.update({
          where: { id: item.id },
          data: {
            status: item.status,
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/work-items/reorder failed", error);
    return NextResponse.json({ error: "Failed to reorder work items" }, { status: 500 });
  }
}
