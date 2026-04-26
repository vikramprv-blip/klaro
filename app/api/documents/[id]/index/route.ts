import { NextRequest, NextResponse } from "next/server";
import { indexDocument } from "@/lib/document-indexer";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await indexDocument(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Indexing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
