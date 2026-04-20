// ── app/api/lawyer/stats/route.ts ────────────────────────────────────────────
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const today   = new Date().toISOString().split("T")[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]

  const [matters, hearings, tasks] = await Promise.all([
    supabaseAdmin.from("legal_matters").select("status, priority"),
    supabaseAdmin.from("legal_hearings").select("hearing_date").gte("hearing_date", today).lte("hearing_date", in7days),
    supabaseAdmin.from("legal_tasks").select("status, due_date"),
  ])

  const m = matters.data ?? []
  const t = tasks.data ?? []

  return NextResponse.json({
    activeMatters:    m.filter(x => x.status === "active").length,
    urgentMatters:    m.filter(x => x.priority === "urgent" && x.status === "active").length,
    hearingsThisWeek: hearings.data?.length ?? 0,
    pendingTasks:     t.filter(x => x.status === "pending").length,
    overdueTasks:     t.filter(x => x.status !== "done" && x.due_date && x.due_date < today).length,
  })
}
