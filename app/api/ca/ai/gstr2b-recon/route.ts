import { logAiUsage } from "@/lib/logAiUsage";
import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const SYSTEM = 'You are an expert Indian GST CA. Reconcile GSTR-2B against purchase register and respond ONLY with valid JSON, no markdown: {"total_itc_2b":"string","total_itc_books":"string","difference":"string","mismatches":[{"supplier":"string","issue":"string","amount":"string"}],"missing_in_2b":["string"],"excess_in_2b":["string"],"recommendations":["string"],"summary":"string"}'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const userMessage = `GSTR-2B data:\n${body.gstr2b ?? ""}\n\nPurchase register:\n${body.purchases ?? ""}`
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
  if (res.ok) { logAiUsage({ feature: "gstr2b-recon", model: "llama-3.3-70b-versatile", tokens_used: data.usage?.total_tokens || 0 }); }
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? "Groq error" }, { status: 500 })
  const txt = data.choices?.[0]?.message?.content ?? ""
  try { return NextResponse.json(JSON.parse(txt)) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
