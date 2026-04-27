import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const SYSTEM = 'You are an expert Indian CA for AY 2026-27 tax optimisation. Old regime: std deduction Rs50k, 80C max Rs1.5L, 80D, 80CCD(1B) Rs50k. New regime: std deduction Rs75k, lower slabs (0-3L:0%, 3-7L:5%, 7-10L:10%, 10-12L:15%, 12-15L:20%, 15L+:30%). Respond ONLY with valid JSON, no markdown: {"old_regime_tax":"string","new_regime_tax":"string","effective_rate_old":"string","effective_rate_new":"string","recommended_regime":"old or new","savings_amount":"string","old_regime_taxable_income":"string","new_regime_taxable_income":"string","deductions_used":{"80C":"string","80D":"string","HRA":"string","24b":"string"},"optimisation_tips":["string"],"unused_deductions":["string"],"summary":"string"}'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const b = body
  const userMessage = `Optimise: Name:{name}, Age:{age}, Employment:{employment}, Income:Rs{gross_income}, HRA:Rs{hra}, HomeLoan:Rs{home_loan}, 80C:Rs{investments_80c}, NPS:Rs{nps}, MedIns:Rs{medical_insurance}, Other:{other_deductions}`
    .replace("{name}", b.name ?? "")
    .replace("{age}", b.age ?? "")
    .replace("{employment}", b.employment ?? "")
    .replace("{gross_income}", b.gross_income ?? "")
    .replace("{hra}", b.hra ?? "")
    .replace("{home_loan}", b.home_loan ?? "")
    .replace("{investments_80c}", b.investments_80c ?? "")
    .replace("{nps}", b.nps ?? "")
    .replace("{medical_insurance}", b.medical_insurance ?? "")
    .replace("{other_deductions}", b.other_deductions ?? "")
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
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
