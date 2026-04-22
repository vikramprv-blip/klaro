import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

export async function generateEmbedding(input: string): Promise<number[]> {
  const client = getOpenAIClient();
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  return res.data[0].embedding;
}

export async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  if (!inputs.length) return [];
  const client = getOpenAIClient();
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: inputs,
  });
  return res.data.map((d) => d.embedding);
}
