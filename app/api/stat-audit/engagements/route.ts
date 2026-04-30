import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  const { data, error } = await sb.from("stat_audit_engagements").select("*").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ engagements: data || [] })
}
export async function POST(req: Request) {
  const body = await req.json()
  const count = (await sb.from("stat_audit_engagements").select("id", { count: "exact", head: true })).count || 0
  const engagement_no = `SA-${new Date().getFullYear()}-${String(Number(count)+1).padStart(4,"0")}`
  const { data, error } = await sb.from("stat_audit_engagements").insert([{ ...body, engagement_no, status: "planning" }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json()
  const { data, error } = await sb.from("stat_audit_engagements").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
