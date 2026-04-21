import { NextRequest, NextResponse } from "next/server"

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ── PDF extraction ────────────────────────────────────────────────────────
    if (ext === "pdf") {
      try {
        // Use pdf-parse
        const pdfParse = (await import("pdf-parse")).default
        const data = await pdfParse(buffer)
        return NextResponse.json({
          text: data.text,
          pages: data.numpages,
          filename: file.name,
        })
      } catch (e: any) {
        // Fallback: return error with instructions
        return NextResponse.json({
          error: "PDF parsing failed. Please copy-paste the text instead.",
          detail: e.message,
        }, { status: 500 })
      }
    }

    // ── Excel extraction ──────────────────────────────────────────────────────
    if (["xlsx", "xls"].includes(ext)) {
      try {
        const XLSX = await import("xlsx")
        const workbook = XLSX.read(buffer, { type: "buffer" })
        let text = ""
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const csv = XLSX.utils.sheet_to_csv(sheet)
          text += `Sheet: ${sheetName}\n${csv}\n\n`
        })
        return NextResponse.json({ text, filename: file.name })
      } catch (e: any) {
        return NextResponse.json({ error: "Excel parsing failed", detail: e.message }, { status: 500 })
      }
    }

    // ── CSV / TXT ─────────────────────────────────────────────────────────────
    if (["csv", "txt"].includes(ext)) {
      const text = buffer.toString("utf-8")
      return NextResponse.json({ text, filename: file.name })
    }

    return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Extraction failed" }, { status: 500 })
  }
}
