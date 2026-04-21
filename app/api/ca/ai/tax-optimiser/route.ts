import { NextRequest, NextResponse } from "next/server"

const SYSTEM = `You are an expert Indian CA for AY 2026-27 tax optimisation.
Old regime: standard deduction ₹50k, 80C max ₹1.5L, 80D, 80CCD(1B) ₹50k, 24(b) home loan interest.
New regime: standard deduction ₹75k, no 80C/80D/HRA, lower slabs (0-3L:0%, 3-7L:5%, 7-10L:10%, 10-12L:15%, 12-15L:20%, 15L+:30%).
Respond ONLY with JSON (no markdown):
{"old_regime_tax":"₹X","new_regime_tax":"₹X","effective_rate_old":"X%","effective_rate_new":"X%","recommended_regime":"old or new","savings_amount":"₹X","old_regime_taxable_income":"₹X","new_regime_taxable_income":"₹X","deductions_used":{"80C":"₹X","80D":"₹X","HRA":"₹X","24b":"₹X"},"optimisation_tips":[],"unused_deductions":[],"summary":"recommendation"}`

export async function POST(req: NextRequest) {
  const b = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: SYSTEM,
      messages: [{ role: "user", content: `Optimise: Name:${b.name}, Age:${b.age}, Employment:${b.employment}, Income:₹${b.gross_income}, HRA:₹${b.hra}, HomeLoan:₹${b.home_loan}, 80C:₹${b.investments_80c}, NPS:₹${b.nps}, MedIns:₹${b.medical_insurance}, Other:${b.other_deductions}` }] }),
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text ?? ""
  try { return NextResponse.json(JSON.parse(txt.replace(/```json|```/g,"").trim())) }
  catch { return NextResponse.json({ error: "Parse failed", raw: txt }, { status: 500 }) }
}
