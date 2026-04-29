import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSessionFirm } from "@/lib/us/firm"
export const dynamic = "force-dynamic"

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ kpi: {}, overdueTasks: [], upcomingDeadlines: [], recentActivity: [], sentinelAlerts: [] })

  const today = new Date().toISOString().split("T")[0]
  const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  const [mattersRes, tasksRes, timeRes, blockersRes] = await Promise.all([
    sb.from("us_matters").select("*").eq("firm_id", firmId),
    sb.from("us_matter_tasks").select("*, us_matters(title, client_name)").eq("firm_id", firmId).neq("status", "done").order("due_date").limit(10),
    sb.from("us_time_entries").select("hours, amount, date, attorney").eq("firm_id", firmId).gte("date", monthStart),
    sb.from("us_blockers").select("*").eq("firm_id", firmId).eq("status", "active"),
  ])

  const matters = mattersRes.data || []
  const tasks = tasksRes.data || []
  const timeEntries = timeRes.data || []
  const blockers = blockersRes.data || []

  const hoursThisMonth = timeEntries.reduce((s, t) => s + Number(t.hours || 0), 0)
  const revenueThisMonth = timeEntries.reduce((s, t) => s + Number(t.amount || 0), 0)
  const upcomingDeadlines = matters.filter(m => m.filing_deadline && m.filing_deadline >= today && m.filing_deadline <= weekAhead)
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today)
  const activeBlockers = blockers.filter(b => b.status === "active")
  const escalatedBlockers = activeBlockers.filter(b =>
    Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000) > 3
  )

  const critical = matters.filter(m => {
    const matterTasks = tasks.filter(t => (t as any).matter_id === m.id)
    return matterTasks.filter(t => t.due_date && t.due_date < today).length > 2
  }).length
  const firmHealthScore = Math.max(0, 100 - critical * 20 - escalatedBlockers.length * 8 - overdueTasks.length * 3)

  const recentActivity = [
    ...matters.slice(0, 3).map(m => ({ time: m.created_at, text: `Matter opened: ${m.client_name} — ${m.title}`, type: "matter" })),
    ...timeEntries.slice(0, 3).map(t => ({ time: t.date, text: `${t.hours}h logged${t.attorney ? ` by ${t.attorney}` : ""}`, type: "time" })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

  const sentinelAlerts = [
    critical > 0 ? `${critical} matter${critical > 1 ? "s are" : " is"} critical — immediate action required` : null,
    overdueTasks.length > 0 ? `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} — review and reassign` : null,
    escalatedBlockers.length > 0 ? `${escalatedBlockers.length} blocker${escalatedBlockers.length > 1 ? "s have" : " has"} been active 3+ days — escalate now` : null,
  ].filter(Boolean)

  return NextResponse.json({
    kpi: {
      activeMatters: matters.filter(m => m.status === "active").length,
      totalMatters: matters.length,
      revenueThisMonth,
      hoursThisMonth,
      upcomingDeadlines: upcomingDeadlines.length,
      activeBlockers: activeBlockers.length,
      escalatedBlockers: escalatedBlockers.length,
      firmHealthScore,
    },
    overdueTasks,
    upcomingDeadlines,
    recentActivity,
    sentinelAlerts,
  })
}
