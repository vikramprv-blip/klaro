import { logAiUsage } from "@/lib/logAiUsage";
import { NextRequest, NextResponse } from "next/server"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const SYSTEM = 'You are an expert Indian CA. Calculate penalty and interest for late filings. GST: Rs50/day late fee max Rs5000, 18% pa interest. TDS: Rs200/day u/s 234E. ITR: Rs5000 u/s 234F. Respond ONLY with valid JSON, no markdown: {"days_late":0,"late_fee":"string","interest":"string","total_payable":"string","sections_invoked":"string","calculation_breakdown":"string","waiver_possibility":"string","note":"string"}'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const b = body
  const userMessage = `Calculate: Tax:{tax_type}, Return:{return_type}, Due:{due_date}, Filed:{filed_date}, Tax amount:Rs{tax_amount}, Turnover:Rs{turnover}`
    .replace("{tax_type}", b.tax_type ?? "")
    .replace("{return_type}", b.return_type ?? "")
    .replace("{due_date}", b.due_date ?? "")
    .replace("{filed_date}", b.filed_date ?? "")
    .replace("{tax_amount}", b.tax_amount ?? "")
    .replace("{turnover}", b.turnover ?? "")
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
  if (res.ok) { logAiUsage({ feature: "penalty-calc", model: "llama-3.3-70b-versatile", tokens_used: data.usage?.total_tokens || 0 }); }
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? "Groq error" }, { status: 500 })
  const txt = data.choices?.[0]?.message?.content ?? ""
  try { return NextResponse.json(JSON.parse(txt)) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
