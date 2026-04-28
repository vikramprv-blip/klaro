import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanLimit } from "@/lib/usage/check-usage";

export async function GET() {
  const plan = "starter";

  const documentCount = await prisma.documents.count();

  return NextResponse.json({
    plan,
    documentCount,
    limit: getPlanLimit(plan),
    locked: documentCount >= getPlanLimit(plan),
  });
}
