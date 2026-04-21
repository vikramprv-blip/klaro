import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are a CA communication specialist. Draft professional, warm messages to chase client documents.
For WhatsApp: conversational, can use emoji sparingly. For email: formal with subject line.
Respond ONLY with JSON (no markdown):
{"message":"main message","follow_up":"follow-up if no reply in 3 days","subject_line":"email subject if applicable"}`

export async function POST(req: NextRequest) {
  const { client_name, missing_docs, service_type, ca_name, channel } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM,
      messages: [{ role: "user", content: `Draft ${channel} message. CA: ${ca_name}. Client: ${client_name}. Service: ${service_type}. Missing: ${missing_docs}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
