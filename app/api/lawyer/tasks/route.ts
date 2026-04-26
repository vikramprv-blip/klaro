// ── app/api/lawyer/tasks/route.ts ────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("legal_tasks")
    .select("*, legal_matters(client_name, matter_title)")
    .order("due_date", { ascending: true, nullsFirst: false })
  if (error) return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rows = Array.isArray(body) ? body : [body]
  const { data, error } = await supabaseAdmin.from("legal_tasks").insert(rows).select()
  if (error) return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  return NextResponse.json(data)
}
