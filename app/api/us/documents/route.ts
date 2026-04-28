import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanLimit } from "@/lib/usage/check-usage";

export async function POST(req: Request) {
  const body = await req.json();

  const plan = "starter";

  const count = await prisma.documents.count();
  const limit = getPlanLimit(plan);

  if (count >= limit) {
    return NextResponse.json(
      { error: "Upgrade required" },
      { status: 403 }
    );
  }

  const doc = await prisma.documents.create({
    data: {
      title: body.title || "Untitled Document",
      file_name: body.file_name,
      file_url: body.file_url,
      status: "pending",
    },
  });

  return NextResponse.json({ doc });
}
