import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret")

  if (!process.env.KLARO_ADMIN_SECRET || adminSecret !== process.env.KLARO_ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("us_firms")
    .select("id, name, email, plan, billing_status, storage_limit_mb, valid_till, billing_updated_at")
    .order("billing_updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ firms: data || [] })
}
