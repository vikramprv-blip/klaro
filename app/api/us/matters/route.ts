import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSessionFirm } from "@/lib/us/firm"
export const dynamic = "force-dynamic"

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function matterNo() {
  return `M-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

export async function GET(req: Request) {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ matters: [], stats: {} })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  let q = sb.from("us_matters").select("*").eq("firm_id", firmId).order("created_at", { ascending: false })
  if (status && status !== "all") q = q.eq("status", status)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const matters = data || []
  const today = new Date().toISOString().split("T")[0]
  const stats = {
    total: matters.length,
    active: matters.filter(m => m.status === "active").length,
    pending: matters.filter(m => m.status === "pending").length,
    closed: matters.filter(m => m.status === "closed").length,
    deadlines_this_week: matters.filter(m => {
      if (!m.filing_deadline) return false
      const days = Math.ceil((new Date(m.filing_deadline).getTime() - Date.now()) / 86400000)
      return days >= 0 && days <= 7
    }).length,
    total_retainer: matters.reduce((s, m) => s + Number(m.retainer || 0), 0),
    total_billed_hours: matters.reduce((s, m) => s + Number(m.billed_hours || 0), 0),
  }
  return NextResponse.json({ matters, stats })
}

export async function POST(req: Request) {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await req.json()
  const { data, error } = await sb.from("us_matters").insert({
    ...body,
    firm_id: firmId,
    matter_number: matterNo(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { id, ...updates } = await req.json()
  const { data, error } = await sb.from("us_matters")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).eq("firm_id", firmId).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { id } = await req.json()
  const { error } = await sb.from("us_matters").delete().eq("id", id).eq("firm_id", firmId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
