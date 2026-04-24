import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email || password.length < 8) {
    return new NextResponse("Name, valid email and 8+ character password required", { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return new NextResponse("Account already exists. Please sign in.", { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ ok: true });
}
