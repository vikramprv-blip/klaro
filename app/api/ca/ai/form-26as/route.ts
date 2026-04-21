import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const SYSTEM = 'You are an expert Indian CA. Analyse Form 26AS / AIS data and respond ONLY with valid JSON, no markdown: {"tds_entries":[{"deductor":"string","section":"string","amount":"string","quarter":"string"}],"total_tds":"string","advance_tax":"string","self_assessment_tax":"string","high_value_transactions":["string"],"mismatches":["string"],"recommendations":["string"],"summary":"string"}'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const userMessage = 'Analyse this 26AS/AIS data:\n\n' + (body.text ?? "")
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
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
