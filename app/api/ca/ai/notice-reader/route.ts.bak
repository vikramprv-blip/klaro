import { NextRequest, NextResponse } from "next/server"

const SYSTEM = "You are an expert Indian CA specialising in GST, Income Tax, and TDS notices. Analyse the notice text and respond ONLY with valid JSON (no markdown, no backticks): {\"notice_type\":\"e.g. Show Cause Notice u/s 73 CGST\",\"issuing_authority\":\"e.g. CGST Commissioner Delhi\",\"gstin_or_pan\":\"extract or dash\",\"tax_period\":\"e.g. FY 2023-24\",\"demand_amount\":\"e.g. Rs 4,52,000\",\"reply_deadline\":\"date or dash\",\"urgency\":\"high or medium or low\",\"summary\":\"2-3 sentence summary\",\"key_issues\":[\"allegations raised\"],\"reply_draft\":\"full professional reply letter\",\"documents_needed\":[\"docs to gather\"]}"

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: "No notice text" }, { status: 400 })
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: "Analyse this notice:\\n\\n" + text }],
    }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g, "").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
