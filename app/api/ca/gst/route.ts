import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId   = searchParams.get("clientId")
  const status     = searchParams.get("status")
  const returnType = searchParams.get("returnType")

  let q = supabaseAdmin
    .from("gst_filings")
    .select("*, ca_clients(name, gstin)")
    .order("due_date", { ascending: true })

  if (clientId)   q = q.eq("client_id", clientId)
  if (status)     q = q.eq("status", status)
  if (returnType) q = q.eq("return_type", returnType)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from("gst_filings")
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
