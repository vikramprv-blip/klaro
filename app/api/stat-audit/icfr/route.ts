import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eid = searchParams.get("engagement_id")
  let q = sb.from("stat_audit_icfr").select("*").order("created_at", { ascending: false })
  if (eid) q = q.eq("engagement_id", eid)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await sb.from("stat_audit_icfr").insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json()
  const { data, error } = await sb.from("stat_audit_icfr").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
