import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are an expert Indian CA. Calculate exact penalty and interest for late filings.
GST: ₹50/day late fee (max ₹5000), 18% pa interest on tax. TDS: ₹200/day u/s 234E. ITR: ₹5000 u/s 234F. Advance tax: interest u/s 234B/C.
Respond ONLY with JSON (no markdown):
{"days_late":0,"late_fee":"₹X","interest":"₹X","total_payable":"₹X","sections_invoked":"Section X","calculation_breakdown":"step by step working","waiver_possibility":"any","note":"caveats"}`

export async function POST(req: NextRequest) {
  const b = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY ?? "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM,
      messages: [{ role: "user", content: `Tax: ${b.tax_type}, Return: ${b.return_type}, Due: ${b.due_date}, Filed: ${b.filed_date}, Tax amount: ₹${b.tax_amount}, Turnover: ₹${b.turnover}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
