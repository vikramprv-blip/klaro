import Groq from "groq-sdk";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new Groq({ apiKey });
}

function ensureNumberArray(value: unknown): number[] {
  if (Array.isArray(value) && value.every((x) => typeof x === "number")) {
    return value;
  }
  throw new Error("Embedding response was not a number array");
}

export async function generateEmbedding(input: string): Promise<number[]> {
  const client = getClient();
  const res = await client.embeddings.create({
    model: "nomic-embed-text-v1.5",
    input,
    encoding_format: "float",
  });

  return ensureNumberArray(res.data[0]?.embedding);
}

export async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  if (!inputs.length) return [];

  const client = getClient();
  const res = await client.embeddings.create({
    model: "nomic-embed-text-v1.5",
    input: inputs,
    encoding_format: "float",
  });

  return res.data.map((item) => ensureNumberArray(item.embedding));
}
