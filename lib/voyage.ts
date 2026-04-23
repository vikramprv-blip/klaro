const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings"
const VOYAGE_MODEL = process.env.VOYAGE_MODEL ?? "voyage-3-large"

type VoyageEmbeddingResponse = {
  data: Array<{ embedding: number[] }>
}

async function createEmbeddings(input: string[], inputType: "query" | "document"): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY
  if (!apiKey) throw new Error("Missing VOYAGE_API_KEY")

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input,
      input_type: inputType,
      truncation: true,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Voyage embeddings failed: ${response.status} ${text}`)
  }

  const json = (await response.json()) as VoyageEmbeddingResponse
  return json.data.map((item) => item.embedding)
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await createEmbeddings([text], "query")
  return embedding
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  return createEmbeddings(texts, "document")
}

export function toPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`
}
