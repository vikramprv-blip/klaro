import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateEmbedding } from "@/lib/embeddings";

const prisma = new PrismaClient();

function toVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query ?? "").trim();
    const clientId = body.clientId ? String(body.clientId) : null;
    const documentType = body.documentType ? String(body.documentType) : null;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const embedding = await generateEmbedding(query);
    const vector = toVectorLiteral(embedding);

    const filters: string[] = [];
    const values: any[] = [vector];
    let idx = 2;

    if (clientId) {
      filters.push(`d."clientId" = $${idx++}`);
      values.push(clientId);
    }

    if (documentType) {
      filters.push(`d."documentType" = $${idx++}`);
      values.push(documentType);
    }

    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";

    const rows = await prisma.$queryRawUnsafe(
      `
      select
        dc."documentId",
        d.filename,
        d."documentType",
        d."clientId",
        dc.content as snippet,
        1 - (dc.embedding <=> $1::vector) as "semanticScore"
      from "DocumentChunk" dc
      join "Document" d on d.id = dc."documentId"
      ${whereClause}
      order by dc.embedding <=> $1::vector
      limit 10
      `,
      ...values
    );

    return NextResponse.json({ results: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
