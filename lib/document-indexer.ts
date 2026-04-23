import { PrismaClient } from "@prisma/client"
import { chunkText } from "@/lib/chunk-text"
import { embedDocuments, toPgVector } from "@/lib/voyage"

const prisma = new PrismaClient()

export async function indexDocument(documentId: string) {
  const document = await prisma.documents.findUnique({
    where: { id: documentId },
    include: { Client: true },
  })

  if (!document) {
    throw new Error("Document not found")
  }

  const sourceText = [document.title, document.notes, document.file_name]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join("\n\n")
    .trim()

  if (!sourceText) {
    return {
      ok: false,
      reason: "No indexable text found on document record",
      chunks: 0,
    }
  }

  await prisma.$executeRawUnsafe(
    `DELETE FROM "public"."document_chunks" WHERE "documentId" = $1`,
    documentId
  )

  const chunks = chunkText(sourceText)
  const batchSize = 32

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
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
        documentId,
        chunk.chunkIndex,
        chunk.content,
        toPgVector(embedding)
      )
    }
  }

  return {
    ok: true,
    documentId,
    chunks: chunks.length,
  }
}
