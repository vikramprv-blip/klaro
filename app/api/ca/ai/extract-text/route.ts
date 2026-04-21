import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (ext === "pdf") {
      return NextResponse.json({
        error: "PDF text extraction not available. Please copy-paste the text from the PDF instead.",
      }, { status: 422 })
    }

    if (["xlsx", "xls"].includes(ext)) {
      const XLSX = await import("xlsx")
      const workbook = XLSX.read(buffer, { type: "buffer" })
      let text = ""
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        text += `Sheet: ${sheetName}\n${csv}\n\n`
      })
      return NextResponse.json({ text, filename: file.name })
    }

    if (["csv", "txt"].includes(ext)) {
      const text = buffer.toString("utf-8")
      return NextResponse.json({ text, filename: file.name })
    }

    return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Extraction failed" }, { status: 500 })
  }
}
