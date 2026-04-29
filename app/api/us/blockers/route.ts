import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSessionFirm } from "@/lib/us/firm"
export const dynamic = "force-dynamic"

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ blockers: [], stats: {} })

  const { data, error } = await sb.from("us_blockers").select("*").eq("firm_id", firmId).order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const blockers = (data || []).map(b => ({
    ...b,
    days_blocked: Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000),
    escalated: Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000) > 3,
  }))

  return NextResponse.json({
    blockers,
    stats: {
      total: blockers.length,
      active: blockers.filter(b => b.status === "active").length,
      escalated: blockers.filter(b => b.escalated && b.status === "active").length,
      resolved: blockers.filter(b => b.status === "resolved").length,
      critical: blockers.filter(b => b.severity === "critical" && b.status === "active").length,
    }
  })
}

export async function POST(req: Request) {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await req.json()
  const { data, error } = await sb.from("us_blockers").insert({ ...body, firm_id: firmId, status: "active" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { firmId } = await getSessionFirm()
  if (!firmId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { id, status, ...updates } = await req.json()
  const patch: any = { ...updates, updated_at: new Date().toISOString() }
  if (status) patch.status = status
  if (status === "resolved") patch.resolved_at = new Date().toISOString()

  const { data, error } = await sb.from("us_blockers").update(patch).eq("id", id).eq("firm_id", firmId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
