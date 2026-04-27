import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const cookieStore = await cookies()

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userData } = await supabase
    .from("users")
    .select("firm_id")
    .eq("id", user.id)
    .single()

  const firm_id = userData?.firm_id

  if (!firm_id) {
    return NextResponse.json({ error: "No firm found" }, { status: 400 })
  }

  const { data: firm } = await supabase
    .from("us_firms")
    .select("plan, billing_status, storage_limit_mb")
    .eq("id", firm_id)
    .single()

  const { data } = await supabase
    .from("document_vault")
    .select("file_size")
    .eq("firm_id", firm_id)
    .is("deleted_at", null)

  const used = (data || []).reduce((sum, d) => sum + (d.file_size || 0), 0)

  // simple plan logic (we'll evolve later)
  const limit = (firm?.storage_limit_mb ?? 1024) * 1024 * 1024

  return NextResponse.json({
    used,
    limit,
    limitMb: firm?.storage_limit_mb ?? 1024,
    plan: firm?.plan ?? "FREE",
    billingStatus: firm?.billing_status ?? "active",
    percent: Math.round((used / limit) * 100),
  })
}
