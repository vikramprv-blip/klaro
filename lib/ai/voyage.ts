import { VoyageAIClient } from "voyageai";

const apiKey = process.env.VOYAGE_API_KEY;
const model = process.env.VOYAGE_EMBED_MODEL || "voyage-3-large";

export function getVoyageClient() {
  if (!apiKey) throw new Error("Missing VOYAGE_API_KEY");
  return new VoyageAIClient({ apiKey });
}

export async function embedTexts(input: string | string[]) {
  const client = getVoyageClient();
  const texts = Array.isArray(input) ? input : [input];

  const res = await client.embed({
    input: texts,
    model,
  });

  const rows = res.data ?? [];
  const embeddings = rows
    .map((row: any) => row?.embedding)
    .filter((embedding: any) => Array.isArray(embedding));

  if (embeddings.length !== texts.length) {
    throw new Error(`Expected ${texts.length} embeddings, got ${embeddings.length}`);
  }

  return embeddings as number[][];
}

export async function embedQuery(input: string) {
  const [embedding] = await embedTexts(input);
  if (!embedding) throw new Error("No embedding returned from Voyage");
  return embedding;
}
