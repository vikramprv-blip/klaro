import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are an expert Indian GST CA. Reconcile GSTR-2B against purchase register.
Respond ONLY with JSON (no markdown):
{"total_itc_2b":"₹X","total_itc_books":"₹X","difference":"₹X","mismatches":[{"supplier":"name","issue":"desc","amount":"₹X"}],"missing_in_2b":[],"excess_in_2b":[],"recommendations":[],"summary":"overview"}`

export async function POST(req: NextRequest) {
  const { gstr2b, purchases } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY ?? "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: SYSTEM,
      messages: [{ role: "user", content: `GSTR-2B:\n${gstr2b}\n\nPurchase register:\n${purchases}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
