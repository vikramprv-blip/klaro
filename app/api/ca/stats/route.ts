import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const today   = new Date().toISOString().split("T")[0]
  const in14    = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]

  const [clients, gstAll, tdsAll, itrAll, advAll, deadlines] = await Promise.all([
    supabaseAdmin.from("ca_clients").select("id", { count: "exact" }).eq("is_active", true),
    supabaseAdmin.from("gst_filings").select("status, due_date"),
    supabaseAdmin.from("tds_filings").select("status, due_date"),
    supabaseAdmin.from("itr_filings").select("status"),
    supabaseAdmin.from("advance_tax").select("status, due_date"),
    supabaseAdmin.from("compliance_deadlines").select("id, title, due_date, deadline_type")
      .gte("due_date", today).lte("due_date", in14).order("due_date"),
  ])

  const gst = gstAll.data ?? []
  const tds = tdsAll.data ?? []
  const itr = itrAll.data ?? []
  const adv = advAll.data ?? []

  return NextResponse.json({
    totalClients:      clients.count ?? 0,
    gstPending:        gst.filter(f => ["pending","in_progress"].includes(f.status)).length,
    gstOverdue:        gst.filter(f => f.status === "pending" && f.due_date < today).length,
    gstFiled:          gst.filter(f => f.status === "filed").length,
    tdsPending:        tds.filter(f => ["pending","in_progress"].includes(f.status)).length,
    tdsOverdue:        tds.filter(f => f.status === "pending" && f.due_date < today).length,
    itrPending:        itr.filter(f => f.status === "pending").length,
    itrDocsPending:    itr.filter(f => f.status === "docs_pending").length,
    advanceTaxOverdue: adv.filter(f => f.status === "pending" && f.due_date < today).length,
    upcomingDeadlines: deadlines.data ?? [],
  })
}
