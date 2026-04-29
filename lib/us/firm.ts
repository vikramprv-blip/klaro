import { createServerSupabase } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getSessionFirm(): Promise<{ userId: string | null; firmId: string | null }> {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { userId: null, firmId: null }
    const { data: member } = await sb
      .from("us_firm_members")
      .select("firm_id")
      .eq("user_id", user.id)
      .single()
    return { userId: user.id, firmId: member?.firm_id ?? null }
  } catch {
    return { userId: null, firmId: null }
  }
}

export async function ensureFirm(userId: string, meta: {
  firmName: string; firmType: string; plan: string;
  state?: string; size?: string; practiceAreas?: string[]
}): Promise<string> {
  // Check if already has a firm
  const { data: existing } = await sb
    .from("us_firm_members")
    .select("firm_id")
    .eq("user_id", userId)
    .single()
  if (existing?.firm_id) return existing.firm_id

  // Create firm
  const { data: firm } = await sb.from("us_firms").insert({
    name: meta.firmName,
    firm_type: meta.firmType,
    plan: meta.plan,
    owner_id: userId,
    state: meta.state || null,
    size: meta.size || null,
    practice_areas: meta.practiceAreas || [],
  }).select().single()

  if (!firm) throw new Error("Failed to create firm")

  // Add owner as member
  await sb.from("us_firm_members").insert({
    firm_id: firm.id,
    user_id: userId,
    role: "owner",
  })

  return firm.id
}
