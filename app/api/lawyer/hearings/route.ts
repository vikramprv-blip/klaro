// ── app/api/lawyer/hearings/route.ts ─────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("legal_hearings")
    .select("*, legal_matters(client_name, matter_title)")
    .order("hearing_date", { ascending: true })

  if (error) {
    console.error("LAWYER_HEARINGS_GET_ERROR:", error)
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from("legal_hearings")
    .insert(body)
    .select()
    .single()

  if (error) {
    console.error("LAWYER_HEARINGS_POST_ERROR:", error)
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }

  return NextResponse.json(data)
}
