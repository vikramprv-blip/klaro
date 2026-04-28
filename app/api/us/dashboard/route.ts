import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const weekAhead = new Date(Date.now() + 7*86400000).toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const [mattersRes, tasksRes, timeRes, blockersRes, sentinelRes] = await Promise.all([
    sb.from("us_matters").select("*").eq("firm_id", FIRM),
    sb.from("us_matter_tasks").select("*, us_matters(title, client_name)").neq("status", "done").order("due_date").limit(10),
    sb.from("us_time_entries").select("hours, amount, date, attorney").eq("firm_id", FIRM).gte("date", monthStart),
    sb.from("us_blockers").select("*").eq("firm_id", FIRM).eq("status", "active"),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://klaro.services"}/api/us/sentinel`).then(r => r.json()).catch(() => null),
  ]);

  const matters = mattersRes.data || [];
  const tasks = tasksRes.data || [];
  const timeEntries = timeRes.data || [];
  const blockers = blockersRes.data || [];

  const hoursThisMonth = timeEntries.reduce((s, t) => s + Number(t.hours || 0), 0);
  const revenueThisMonth = timeEntries.reduce((s, t) => s + Number(t.amount || 0), 0);
  const upcomingDeadlines = matters.filter(m => m.filing_deadline && m.filing_deadline >= today && m.filing_deadline <= weekAhead);
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today);
  const activeBlockers = blockers.filter(b => b.status === "active");
  const escalatedBlockers = activeBlockers.filter(b => Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000) > 3);

  const recentActivity = [
    ...matters.slice(0, 3).map(m => ({ time: m.created_at, text: `Matter opened: ${m.client_name} — ${m.title}`, type: "matter" })),
    ...timeEntries.slice(0, 3).map(t => ({ time: t.date, text: `${t.hours}h logged${t.attorney ? ` by ${t.attorney}` : ""}`, type: "time" })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  return NextResponse.json({
    kpi: {
      activeMatters: matters.filter(m => m.status === "active").length,
      totalMatters: matters.length,
      hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
      revenueThisMonth,
      upcomingDeadlines: upcomingDeadlines.length,
      overdueTasks: overdueTasks.length,
      activeBlockers: activeBlockers.length,
      escalatedBlockers: escalatedBlockers.length,
      firmHealthScore: sentinelRes?.firm_health_score || 0,
    },
    upcomingDeadlines: upcomingDeadlines.slice(0, 5),
    overdueTasks: overdueTasks.slice(0, 5),
    recentActivity,
    escalatedBlockers: escalatedBlockers.slice(0, 3),
    sentinelAlerts: sentinelRes?.recommendations || [],
  });
}
