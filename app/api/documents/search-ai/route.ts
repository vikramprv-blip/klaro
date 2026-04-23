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
    const client_id = body.client_id ? String(body.client_id) : null;
    const document_type = body.document_type ? String(body.document_type) : null;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const embedding = await generateEmbedding(query);
    const vector = toVectorLiteral(embedding);

    const filters: string[] = [];
    const values: any[] = [vector];
    let idx = 2;

    if (client_id) {
      filters.push(`d."client_id" = $${idx++}`);
      values.push(client_id);
    }

    if (document_type) {
      filters.push(`d."document_type" = $${idx++}`);
      values.push(document_type);
    }

    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";

    const rows = await prisma.$queryRawUnsafe(
      `
      select
        dc."documentId",
        d.file_name,
        d."document_type",
        d."client_id",
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
