import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const q = (searchParams.get("q") ?? "").trim()
    const document_type = (searchParams.get("document_type") ?? "").trim()
    const client_id = (searchParams.get("client_id") ?? "").trim()

    const where = {
      ...(document_type ? { document_type: document_type } : {}),
      ...(client_id ? { client_id: client_id } : {}),
      ...(q
        ? {
            OR: [
              {
                file_name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                title: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                notes: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    }

    const documents = await prisma.documents.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
    })

    return NextResponse.json({ ok: true, documents })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to list documents" },
      { status: 500 }
    )
  }
}
