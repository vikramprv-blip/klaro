import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are an expert Indian CA. Analyse the Form 26AS / AIS data provided.
Respond ONLY with JSON (no markdown, no backticks):
{"tds_entries":[{"deductor":"name","section":"194A","amount":"₹25,000","quarter":"Q1"}],"total_tds":"₹1,25,000","advance_tax":"₹0","self_assessment_tax":"₹0","high_value_transactions":[],"mismatches":[],"recommendations":[],"summary":"overview"}`

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY ?? "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: SYSTEM,
      messages: [{ role: "user", content: `Analyse this 26AS/AIS data:\n\n${text}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
