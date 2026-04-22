import { VoyageAIClient } from "voyageai";

const MODEL = process.env.VOYAGE_EMBEDDING_MODEL || "voyage-4-lite";

function getClient() {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY is not set");
  return new VoyageAIClient({ apiKey });
}

function ensureNumberArray(value: unknown): number[] {
  if (Array.isArray(value) && value.every((x) => typeof x === "number")) {
    return value;
  }
  throw new Error("Embedding response was not a number array");
}

export async function generateEmbedding(input: string): Promise<number[]> {
  const client = getClient();
  const res = await client.embed({
    input,
    model: MODEL,
    inputType: "query",
  });

  return ensureNumberArray(res.data?.[0]?.embedding);
}

export async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  if (!inputs.length) return [];

  const client = getClient();
  const res = await client.embed({
    input: inputs,
    model: MODEL,
    inputType: "document",
  });

  return (res.data ?? []).map((item: any) => ensureNumberArray(item.embedding));
}
