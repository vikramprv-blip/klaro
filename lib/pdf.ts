export async function extractPdfText(buffer: Buffer): Promise<string> {
  const mod = (await import("pdf-parse")) as unknown as {
    default?: (input: Buffer) => Promise<{ text?: string }>
  }

  const pdfParse =
    mod.default ??
    ((mod as unknown) as (input: Buffer) => Promise<{ text?: string }>)

  const result = await pdfParse(buffer)
  return (result.text ?? "").replace(/\u0000/g, " ").trim()
}
