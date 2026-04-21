import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const SYSTEM = 'You are an expert Indian CA specialising in GST, Income Tax, and TDS notices. Analyse the notice and respond ONLY with valid JSON, no markdown, no backticks: {"notice_type":"string","issuing_authority":"string","gstin_or_pan":"string","tax_period":"string","demand_amount":"string","reply_deadline":"string","urgency":"high or medium or low","summary":"string","key_issues":["string"],"reply_draft":"full reply letter","documents_needed":["string"]}'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const userMessage = 'Analyse this notice:\n\n' + (body.text ?? "")
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
