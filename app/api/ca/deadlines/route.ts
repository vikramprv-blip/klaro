import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("compliance_deadlines")
    .select("*")
    .order("due_date", { ascending: true })
  if (error) return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  return NextResponse.json(data)
}
