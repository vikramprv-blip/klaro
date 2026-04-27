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

  if (!userData?.firm_id) {
    return NextResponse.json({ error: "No firm found" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("client_portal_links")
    .select("token, document_id, expires_at, revoked_at, created_at")
    .eq("firm_id", userData.firm_id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ links: data || [] })
}
