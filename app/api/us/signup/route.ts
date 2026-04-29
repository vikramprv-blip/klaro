import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ensureFirm } from "@/lib/us/firm"

export const dynamic = "force-dynamic"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { accessToken, firmName, firmType, plan, state, size, practiceAreas } = await req.json()

    if (!accessToken) return NextResponse.json({ error: "No token" }, { status: 401 })

    const { data: { user }, error } = await sb.auth.getUser(accessToken)
    if (error || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    // Update user metadata to mark as US vertical
    await sb.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        region: "us",
        vertical: "us",
        firm_name: firmName,
      }
    })

    // Create firm and add user as owner
    const firmId = await ensureFirm(user.id, {
      firmName: firmName || `${user.email?.split("@")[0]}'s Firm`,
      firmType: firmType || "law",
      plan: plan || "foundation",
      state, size, practiceAreas,
    })

    return NextResponse.json({ ok: true, firmId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
