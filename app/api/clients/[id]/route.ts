import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        workItems: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, client });
  } catch (error) {
    console.error("GET /api/clients/[id] failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to load client" }, { status: 500 });
  }
}
