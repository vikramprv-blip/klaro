import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = body;

  if (!userId) return new NextResponse("Missing userId", { status: 400 });

  const existing = await prisma.client.findFirst({
    where: { name: "Demo Client" },
  });

  if (existing) {
    return NextResponse.json({ ok: true, seeded: false });
  }

  const client = await prisma.client.create({
    data: {
      name: "Demo Client",
      email: "demo@client.com",
    },
  });

  await prisma.workItem.create({
    data: {
      title: "File GST return",
      description: "GSTR-3B for current month",
      status: "TODO",
      clientId: client.id,
    },
  });

  return NextResponse.json({ ok: true, seeded: true });
}
