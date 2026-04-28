import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { id, blocked_by, due_date } = body;

  const doc = await prisma.documents.update({
    where: { id },
    data: {
      status: "blocked",
      blocked_by,
      due_date: due_date ? new Date(due_date) : null,
    },
  });

  return NextResponse.json({ doc });
}
