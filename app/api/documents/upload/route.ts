import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"
import { extractPdfText } from "@/lib/pdf"
import { chunkText } from "@/lib/chunk-text"
import { embedDocuments, toPgVector } from "@/lib/voyage"

export const runtime = "nodejs"

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function insertChunks(params: {
  documentId: string
  chunks: Array<{ chunkIndex: number; content: string }>
}) {
  const batchSize = 32

  for (let i = 0; i < params.chunks.length; i += batchSize) {
    const batch = params.chunks.slice(i, i + batchSize)
    const embeddings = await embedDocuments(batch.map((item) => item.content))

    for (let j = 0; j < batch.length; j += 1) {
      const chunk = batch[j]
      const embedding = embeddings[j]

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "public"."document_chunks"
          ("id", "documentId", "chunkIndex", "content", "embedding", "createdAt", "updatedAt")
        VALUES
          (gen_random_uuid(), $1, $2, $3, $4::vector, NOW(), NOW())
        `,
        params.documentId,
        chunk.chunkIndex,
        chunk.content,
        toPgVector(embedding)
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF uploads are supported" }, { status: 400 })
    }

    const client_id = String(formData.get("client_id") || "").trim() || null
    const title = String(formData.get("title") || file.name.replace(/\.pdf$/i, "") || "Untitled Document")
    const source = String(formData.get("source") || file.name)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const file_path = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(file_path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(file_path)

    const text = await extractPdfText(buffer)

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 })
    }

    const document = await prisma.documents.create({
      data: {
        title,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_size: BigInt(file.size),
        file_type: file.type || null,
        doc_category: "PDF",
        notes: source,
        client_id,
      },
      select: { id: true, title: true, file_url: true },
    })

    const chunks = chunkText(text)
    await insertChunks({
      documentId: document.id,
      chunks,
    })

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      title: document.title,
      fileUrl: document.file_url,
      chunks: chunks.length,
      indexed: true,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Upload failed" },
      { status: 500 }
    )
  }
}
