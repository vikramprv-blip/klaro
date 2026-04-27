import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUsStorageLimitMb, US_PLANS, getUsPlan } from "@/lib/us/billing/plans";

async function getCurrentUsFirm(supabase: any) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("us_firm_members")
    .select("firm_id, role")
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership?.firm_id) return null;

  const { data: firm, error: firmError } = await supabase
    .from("us_firms")
    .select("*")
    .eq("id", membership.firm_id)
    .single();

  if (firmError || !firm) return null;

  return { firm, membership, user };
}

export async function GET() {
  const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { getAll() { return []; }, setAll() {} } }
);
  const context = await getCurrentUsFirm(supabase);

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const firm = context.firm;
  const plan = getUsPlan(firm.plan);

  return NextResponse.json({
    firmId: firm.id,
    plan,
    billingStatus: firm.billing_status ?? "active",
    billingProvider: firm.billing_provider ?? "MANUAL",
    validTill: firm.valid_till ?? null,
    storageLimitMb: firm.storage_limit_mb ?? getUsStorageLimitMb(plan),
    plans: US_PLANS,
  });
}

export async function POST(req: Request) {
  const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { getAll() { return []; }, setAll() {} } }
);
  const context = await getCurrentUsFirm(supabase);

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firm, membership } = context;

  if (!["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const requestedPlan = getUsPlan(body.plan);
  const storageLimitMb = getUsStorageLimitMb(requestedPlan);

  const validTill =
    body.validTill ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("us_firms")
    .update({
      plan: requestedPlan,
      billing_status: body.billingStatus ?? "active",
      billing_provider: "MANUAL",
      storage_limit_mb: storageLimitMb,
      valid_till: validTill,
      billing_updated_at: new Date().toISOString(),
    })
    .eq("id", firm.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("us_billing_events").insert({
    firm_id: firm.id,
    event_type: "manual_plan_update",
    old_plan: firm.plan,
    new_plan: requestedPlan,
    old_billing_status: firm.billing_status,
    new_billing_status: body.billingStatus ?? "active",
    old_storage_limit_mb: firm.storage_limit_mb,
    new_storage_limit_mb: storageLimitMb,
    note: body.note ?? "US billing core manual update",
  });

  return NextResponse.json({
    success: true,
    plan: requestedPlan,
    storageLimitMb,
    validTill,
  });
}
