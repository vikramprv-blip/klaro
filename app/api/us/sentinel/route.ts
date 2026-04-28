import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const GROQ_KEY = process.env.GROQ_API_KEY || "";

async function analyzeWithGroq(matters: any[], team: any[]) {
  if (!GROQ_KEY || matters.length === 0) return null;
  const prompt = `You are Klaro Sentinel, an AI that analyzes law firm and CPA firm matter health.

Analyze these active matters and team workload. For each matter, assess:
1. Risk level (on_track/at_risk/critical/blocked)
2. Predicted delay in days (0 if none)
3. One specific actionable insight

Also provide:
- Overall firm health score (0-100)
- Top 3 firm-wide recommendations
- Any capacity warnings

Respond ONLY in valid JSON:
{
  "firm_health_score": 85,
  "matter_analysis": [
    {"id": "...", "risk": "on_track", "predicted_delay_days": 0, "insight": "..."}
  ],
  "recommendations": ["...", "...", "..."],
  "capacity_warnings": ["..."],
  "anomalies": ["..."]
}

Matters: ${JSON.stringify(matters.slice(0, 20))}
Team: ${JSON.stringify(team.slice(0, 10))}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are Klaro Sentinel AI. Always respond in valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    })
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(text); } catch { return null; }
}

export async function GET() {
  const FIRM = "00000000-0000-0000-0000-000000000001";
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [mattersRes, hearingsRes, tasksRes, employeesRes, timesheetsRes] = await Promise.all([
    sb.from("legal_matters").select("id, matter_title, client_name, status, matter_type, created_at, next_date").eq("firm_id", FIRM).eq("status", "active").limit(30),
    sb.from("legal_hearings").select("id, matter_id, hearing_date, court_name, purpose").eq("firm_id", FIRM).gte("hearing_date", today).order("hearing_date").limit(20),
    sb.from("lawyer_tasks").select("id, title, matter_id, status, due_date, priority").eq("firm_id", FIRM).neq("status", "done").order("due_date").limit(30),
    sb.from("Employee").select("id, name, role").eq("orgId", "demo-org"),
    sb.from("TimeEntry").select("employeeId, hours, date").eq("orgId", "demo-org").gte("date", thirtyDaysAgo),
  ]);

  const matters = mattersRes.data || [];
  const hearings = hearingsRes.data || [];
  const tasks = tasksRes.data || [];
  const employees = employeesRes.data || [];
  const timesheets = timesheetsRes.data || [];

  // Calculate matter health without AI first
  const matterHealth = matters.map(m => {
    const matterTasks = tasks.filter(t => t.matter_id === m.id);
    const overdueTasks = matterTasks.filter(t => t.due_date < today);
    const matterHearings = hearings.filter(h => h.matter_id === m.id);

    const daysSinceCreated = Math.floor((Date.now() - new Date(m.created_at).getTime()) / 86400000);
    const hasUpcomingHearing = matterHearings.length > 0;
    const nextHearingDays = hasUpcomingHearing
      ? Math.ceil((new Date(matterHearings[0].hearing_date).getTime() - Date.now()) / 86400000)
      : null;

    let risk = "on_track";
    let insight = "";

    if (overdueTasks.length > 2) { risk = "critical"; insight = `${overdueTasks.length} overdue tasks need immediate attention`; }
    else if (overdueTasks.length > 0) { risk = "at_risk"; insight = `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`; }
    else if (nextHearingDays !== null && nextHearingDays <= 3) { risk = "at_risk"; insight = `Hearing in ${nextHearingDays} day${nextHearingDays !== 1 ? "s" : ""}`; }
    else if (daysSinceCreated > 90) { risk = "at_risk"; insight = "Matter open 90+ days — consider status review"; }
    else { insight = hasUpcomingHearing ? `Next hearing ${nextHearingDays}d away` : "On track"; }

    return { ...m, risk, insight, overdueTasks: overdueTasks.length, upcomingHearings: matterHearings.length, nextHearingDays, daysSinceCreated };
  });

  // Team capacity
  const teamCapacity = employees.map(emp => {
    const empTimesheets = timesheets.filter(t => t.employeeId === emp.id);
    const hoursThisMonth = empTimesheets.reduce((s, t) => s + Number(t.hours || 0), 0);
    const avgHoursPerWeek = hoursThisMonth / 4;
    const empTasks = tasks.filter(t => (t as any).assignedTo === emp.id);
    return { ...emp, hoursThisMonth, avgHoursPerWeek, activeTasks: empTasks.length, overloaded: avgHoursPerWeek > 50 };
  });

  // Quick stats
  const critical = matterHealth.filter(m => m.risk === "critical").length;
  const atRisk = matterHealth.filter(m => m.risk === "at_risk").length;
  const onTrack = matterHealth.filter(m => m.risk === "on_track").length;
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today).length;
  const todayHearings = hearings.filter(h => h.hearing_date === today).length;
  const firmHealthScore = Math.max(0, 100 - (critical * 20) - (atRisk * 8) - (overdueTasks * 3));

  // Try AI analysis
  const aiAnalysis = await analyzeWithGroq(matterHealth, teamCapacity);

  // Merge AI insights if available
  const enrichedMatters = aiAnalysis?.matter_analysis
    ? matterHealth.map(m => {
        const ai = aiAnalysis.matter_analysis.find((a: any) => a.id === m.id);
        return ai ? { ...m, risk: ai.risk || m.risk, insight: ai.insight || m.insight, predicted_delay_days: ai.predicted_delay_days || 0 } : m;
      })
    : matterHealth;

  return NextResponse.json({
    firm_health_score: aiAnalysis?.firm_health_score || firmHealthScore,
    stats: { total: matters.length, critical, at_risk: atRisk, on_track: onTrack, overdueTasks, todayHearings },
    matters: enrichedMatters,
    teamCapacity,
    recommendations: aiAnalysis?.recommendations || [
      critical > 0 ? `${critical} matter${critical > 1 ? "s" : ""} are critical — immediate action required` : null,
      overdueTasks > 0 ? `${overdueTasks} task${overdueTasks > 1 ? "s are" : " is"} overdue` : null,
      todayHearings > 0 ? `${todayHearings} hearing${todayHearings > 1 ? "s" : ""} today — ensure preparation is complete` : null,
    ].filter(Boolean),
    anomalies: aiAnalysis?.anomalies || [],
    capacity_warnings: aiAnalysis?.capacity_warnings || teamCapacity.filter(t => t.overloaded).map(t => `${t.name} is averaging ${t.avgHoursPerWeek.toFixed(0)}h/week — over capacity`),
    ai_powered: !!aiAnalysis,
    refreshed_at: new Date().toISOString(),
  });
}
