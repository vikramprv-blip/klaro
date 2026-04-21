import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are an expert Indian CA and tax auditor. Parse the financial statements.
Respond ONLY with JSON (no markdown):
{"key_figures":{"Revenue from operations":"₹X","Total expenses":"₹X","PBT":"₹X","PAT":"₹X","Total assets":"₹X","Net worth":"₹X"},"ratios":{"gross_margin":"X%","net_margin":"X%"},"anomalies":[],"audit_checklist":[],"tax_implications":[],"summary":"overview"}`

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY ?? "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: SYSTEM,
      messages: [{ role: "user", content: `Parse these financials:\n\n${text}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
