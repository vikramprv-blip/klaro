import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const SYSTEM = 'You are a CA communication specialist. Draft professional warm messages to chase client documents. For WhatsApp: conversational. For email: formal with subject line. Respond ONLY with valid JSON, no markdown: {"message":"string","follow_up":"string","subject_line":"string"}'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const userMessage = `Draft ${body.channel} message. CA:${body.ca_name}. Client:${body.client_name}. Service:${body.service_type}. Missing docs:${body.missing_docs}`
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage },
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? "Groq error" }, { status: 500 })
  const txt = data.choices?.[0]?.message?.content ?? ""
  try { return NextResponse.json(JSON.parse(txt)) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
