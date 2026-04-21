import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are an expert Indian GST consultant. Assess the client's GST compliance health.
Respond ONLY with JSON (no markdown):
{"health_score":75,"grade":"Good","strengths":[],"risks":[],"immediate_actions":[],"recommendations":[],"estimated_exposure":"₹X","summary":"overview"}`

export async function POST(req: NextRequest) {
  const { details } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: SYSTEM,
      messages: [{ role: "user", content: `Assess GST health:\n\n${details}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
