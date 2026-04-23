export type TextChunk = {
  chunkIndex: number
  content: string
}

export function chunkText(
  input: string,
  opts?: { chunkSize?: number; overlap?: number }
): TextChunk[] {
  const chunkSize = opts?.chunkSize ?? 1200
  const overlap = opts?.overlap ?? 200

  const text = input.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
  if (!text) return []

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: TextChunk[] = []

  let buffer = ""
  let chunkIndex = 0

  const pushBuffer = () => {
    const value = buffer.trim()
    if (!value) return
    chunks.push({ chunkIndex, content: value })
    chunkIndex += 1
    buffer = value.slice(Math.max(0, value.length - overlap))
  }

  for (const paragraph of paragraphs) {
    if ((buffer + "\n\n" + paragraph).length <= chunkSize) {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
      continue
    }

    if (buffer) pushBuffer()

    if (paragraph.length <= chunkSize) {
      buffer = paragraph
      continue
    }

    let start = 0
    while (start < paragraph.length) {
      const end = Math.min(start + chunkSize, paragraph.length)
      const slice = paragraph.slice(start, end).trim()
      if (slice) {
        chunks.push({ chunkIndex, content: slice })
        chunkIndex += 1
      }
      start = Math.max(end - overlap, start + 1)
    }
    buffer = ""
  }

  if (buffer.trim()) {
    chunks.push({ chunkIndex, content: buffer.trim() })
  }

  return chunks
}
