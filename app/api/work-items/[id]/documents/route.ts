import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
try {
    const body = await req.json();

    const docs = Array.isArray(body) ? body : [];
    const created = await prisma.$transaction(
      docs.map((doc) =>
        prisma.workDocument.create({
          data: {
            workItemId: id,
            name: doc.name,
            docType: doc.docType,
            status: "MISSING",
          },
        })
      )
    );

    return NextResponse.json({ documents: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create documents" },
      { status: 400 }
    );
  }
}
