import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { userId, email, vertical, plan } = body;

  if (!userId || !email) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  await prisma.organization.create({
    data: {
      userId,
      email,
      vertical,
      plan,
    },
  });

  return NextResponse.json({ ok: true });
}
