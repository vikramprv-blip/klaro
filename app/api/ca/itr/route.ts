// ─────────────────────────────────────────────────────────────────────────────
// app/api/ca/itr/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")
  const status   = searchParams.get("status")

  let q = supabaseAdmin
    .from("itr_filings")
    .select("*, ca_clients(name, pan, entity_type)")
    .order("due_date", { ascending: true })

  if (clientId) q = q.eq("clientId", clientId)
  if (status)   q = q.eq("status", status)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rows = Array.isArray(body) ? body : [body]
  const { data, error } = await supabaseAdmin.from("itr_filings").insert(rows).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
