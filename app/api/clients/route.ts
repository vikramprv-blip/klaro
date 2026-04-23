import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        code: true,
      },
    });

    return NextResponse.json({ ok: true, clients });
  } catch (error) {
    console.error("GET /api/clients failed:", error);
    return NextResponse.json({ ok: false, clients: [] }, { status: 200 });
  }
}
