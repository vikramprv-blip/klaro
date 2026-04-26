// app/api/ca/tds/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")
  const status   = searchParams.get("status")
  const quarter  = searchParams.get("quarter")

  let q = supabaseAdmin
    .from("tds_filings")
    .select("*, ca_clients(name, pan)")
    .order("due_date", { ascending: true })

  if (clientId) q = q.eq("clientId", clientId)
  if (status)   q = q.eq("status", status)
  if (quarter)  q = q.eq("quarter", quarter)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rows = Array.isArray(body) ? body : [body]
  const { data, error } = await supabaseAdmin
    .from("tds_filings")
    .insert(rows)
    .select()
  if (error) return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  return NextResponse.json(data)
}
