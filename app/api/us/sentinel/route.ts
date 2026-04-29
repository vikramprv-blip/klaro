import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSessionFirm } from "@/lib/us/firm"
export const dynamic = "force-dynamic"

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const GROQ_KEY = process.env.GROQ_API_KEY || ""

async function analyzeWithGroq(matters: any[]) {
  if (!GROQ_KEY || matters.length === 0) return null
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are Klaro Sentinel AI. Always respond in valid JSON only." },
        { role: "user", content: `Analyze these law firm matters. For each assess risk (on_track/at_risk/critical/blocked) and give one actionable insight. Also give firm_health_score (0-100) and top 3 recommendations.

Respond ONLY in JSON:
{"firm_health_score":85,"matter_analysis":[{"id":"...","risk":"on_track","predicted_delay_days":0,"insight":"..."}],"recommendations":["..."],"capacity_warnings":[],"anomalies":[]}

Matters: ${JSON.stringify(matters.slice(0, 20))}` }
      ],
      temperature: 0.2, max_tokens: 2000,
    })
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || "{}"
  try { return JSON.parse(text) } catch { return null }
}

export async function GET() {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ firm_health_score: 0, stats: {}, matters: [], recommendations: [], anomalies: [] })

  const today = new Date().toISOString().split("T")[0]

  const [mattersRes, tasksRes] = await Promise.all([
    sb.from("us_matters").select("*").eq("firm_id", firmId).eq("status", "active").limit(30),
    sb.from("us_matter_tasks").select("*").eq("firm_id", firmId).neq("status", "done").order("due_date").limit(50),
  ])

  const matters = mattersRes.data || []
  const tasks = tasksRes.data || []

  const matterHealth = matters.map(m => {
    const matterTasks = tasks.filter(t => (t as any).matter_id === m.id)
    const overdueTasks = matterTasks.filter(t => t.due_date && t.due_date < today)
    const daysSinceCreated = Math.floor((Date.now() - new Date(m.created_at).getTime()) / 86400000)
    let risk = "on_track", insight = "On track"

    if (overdueTasks.length > 2) { risk = "critical"; insight = `${overdueTasks.length} overdue tasks need immediate attention` }
    else if (overdueTasks.length > 0) { risk = "at_risk"; insight = `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}` }
    else if (daysSinceCreated > 90) { risk = "at_risk"; insight = "Matter open 90+ days — consider status review" }

    return { ...m, risk, insight, overdueTasks: overdueTasks.length, daysSinceCreated }
  })

  const critical = matterHealth.filter(m => m.risk === "critical").length
  const atRisk = matterHealth.filter(m => m.risk === "at_risk").length
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today).length
  const firmHealthScore = Math.max(0, 100 - critical * 20 - atRisk * 8 - overdueTasks * 3)

  const aiAnalysis = await analyzeWithGroq(matterHealth)

  const enrichedMatters = aiAnalysis?.matter_analysis
    ? matterHealth.map(m => {
        const ai = aiAnalysis.matter_analysis.find((a: any) => a.id === m.id)
        return ai ? { ...m, risk: ai.risk || m.risk, insight: ai.insight || m.insight, predicted_delay_days: ai.predicted_delay_days || 0 } : m
      })
    : matterHealth

  return NextResponse.json({
    firm_health_score: aiAnalysis?.firm_health_score || firmHealthScore,
    stats: { total: matters.length, critical, at_risk: atRisk, on_track: matterHealth.filter(m => m.risk === "on_track").length, overdueTasks },
    matters: enrichedMatters,
    recommendations: aiAnalysis?.recommendations || [
      critical > 0 ? `${critical} matter${critical > 1 ? "s are" : " is"} critical — assign resources now` : null,
      overdueTasks > 0 ? `${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""} — review and reassign` : null,
    ].filter(Boolean),
    anomalies: aiAnalysis?.anomalies || [],
    capacity_warnings: aiAnalysis?.capacity_warnings || [],
    ai_powered: !!aiAnalysis,
    refreshed_at: new Date().toISOString(),
  })
}
