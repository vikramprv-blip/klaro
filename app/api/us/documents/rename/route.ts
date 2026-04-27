import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { logDocumentActivity } from "@/app/api/us/documents/_lib/log-document-activity"

export async function POST(req: Request) {
  const { id, title } = await req.json()

  const cookieStore = await cookies()

  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("firm_id")
    .eq("id", user.id)
    .single()

  if (!userData?.firm_id) {
    return new Response(JSON.stringify({ error: "No firm found" }), { status: 400 })
  }

  const firm_id = userData.firm_id

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from("document_vault")
    .update({ title })
    .eq("id", id).eq("firm_id", firm_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logDocumentActivity({
    document_id: id,
    firm_id: firm_id || null,
    action: "renamed_document",
    metadata: { title },
  })

  return NextResponse.json({ success: true })
}
