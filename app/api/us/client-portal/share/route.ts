import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function POST(req: Request) {
  const { document_id } = await req.json()

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

  const { data: doc } = await supabase
    .from("document_vault")
    .select("id")
    .eq("id", document_id)
    .eq("firm_id", firm_id)
    .single()

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const token = crypto.randomBytes(24).toString("hex")

  await supabase.from("client_portal_links").insert({
    token,
    document_id,
    firm_id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return NextResponse.json({
    url: `/us/client-portal/${token}`,
  })
}
