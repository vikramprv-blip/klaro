import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (["xlsx", "xls"].includes(ext)) {
      const XLSX = await import("xlsx")
      const workbook = XLSX.read(buffer, { type: "buffer" })
      let text = ""
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName]
        text += `Sheet: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}\n\n`
      })
      return NextResponse.json({ text, filename: file.name })
    }

    if (["csv", "txt"].includes(ext)) {
      return NextResponse.json({ text: buffer.toString("utf-8"), filename: file.name })
    }

    if (ext === "pdf") {
      return NextResponse.json({
        error: "pdf_needs_client_extract",
        message: "PDF will be processed in browser"
      }, { status: 422 })
    }

    return NextResponse.json({ error: `Unsupported: .${ext}` }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
