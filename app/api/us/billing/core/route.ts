import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { getUsPlan, getUsStorageLimitMb, US_PLANS } from "@/lib/us/billing/plans"

async function getContext() {
  const cookieStore = await cookies()

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userData } = await supabase
    .from("users")
    .select("firm_id")
    .eq("id", user.id)
    .single()

  if (!userData?.firm_id) return null

  const { data: firm } = await supabase
    .from("us_firms")
    .select("*")
    .eq("id", userData.firm_id)
    .single()

  if (!firm) return null

  return { supabase, firm, user }
}

export async function GET() {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { firm } = context
  const plan = getUsPlan(firm.plan)

  return NextResponse.json({
    firmId: firm.id,
    plan,
    billingStatus: firm.billing_status ?? "active",
    billingProvider: firm.billing_provider ?? "MANUAL",
    validTill: firm.valid_till ?? null,
    storageLimitMb: firm.storage_limit_mb ?? getUsStorageLimitMb(plan),
    plans: US_PLANS,
  })
}

export async function POST(req: Request) {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { supabase, firm } = context
  const body = await req.json()

  const requestedPlan = getUsPlan(body.plan)
  const billingStatus = body.billingStatus === "pending" ? "pending" : body.billingStatus ?? "active"
  const storageLimitMb = getUsStorageLimitMb(requestedPlan)

  const validTill =
    body.validTill ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from("us_firms")
    .update({
      plan: requestedPlan,
      billing_status: billingStatus,
      billing_provider: "MANUAL",
      storage_limit_mb: storageLimitMb,
      valid_till: validTill,
      billing_updated_at: new Date().toISOString(),
    })
    .eq("id", firm.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("us_billing_events").insert({
    firm_id: firm.id,
    event_type: billingStatus === "pending" ? "manual_payment_pending" : "manual_plan_update",
    old_plan: firm.plan,
    new_plan: requestedPlan,
    old_billing_status: firm.billing_status,
    new_billing_status: billingStatus,
    old_storage_limit_mb: firm.storage_limit_mb,
    new_storage_limit_mb: storageLimitMb,
    note: body.note ?? "US billing manual update",
  })

  return NextResponse.json({
    success: true,
    plan: requestedPlan,
    billingStatus,
    storageLimitMb,
    validTill,
  })
}
