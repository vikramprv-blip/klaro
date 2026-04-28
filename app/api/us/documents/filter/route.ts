import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blockedOnly = searchParams.get("blockedOnly") === "true";

  const documents = await prisma.documents.findMany({
    where: blockedOnly
      ? {
          status: "blocked",
        }
      : {},
    orderBy: {
      created_at: "desc",
    },
  });

  return NextResponse.json({ documents });
}
