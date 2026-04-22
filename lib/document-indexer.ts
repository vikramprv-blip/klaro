import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { splitTextIntoChunks } from "./chunking";
import { generateEmbeddings } from "./embeddings";

const prisma = new PrismaClient();

function toVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

export async function indexDocument(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { client: true },
  });

  if (!document || !document.content?.trim()) {
    throw new Error("Document content not found");
  }

  const chunks = splitTextIntoChunks(document.content);
  const inputs = chunks.map(
    (chunk) =>
      `Filename: ${document.filename}\nDocument Type: ${document.documentType ?? ""}\nClient: ${document.client?.name ?? ""}\nContent: ${chunk}`
  );

  const embeddings = await generateEmbeddings(inputs);

  await prisma.$executeRawUnsafe(
    `delete from "DocumentChunk" where "documentId" = $1`,
    documentId
  );

  for (let i = 0; i < chunks.length; i++) {
    await prisma.$executeRawUnsafe(
      `insert into "DocumentChunk" (id, "documentId", "chunkIndex", content, embedding, "createdAt")
       values ($1, $2, $3, $4, $5::vector, now())`,
      randomUUID(),
      documentId,
      i,
      chunks[i],
      toVectorLiteral(embeddings[i])
    );
  }

  return { success: true, chunks: chunks.length };
}
