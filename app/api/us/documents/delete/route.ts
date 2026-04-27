import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { logDocumentActivity } from "@/app/api/us/documents/_lib/log-document-activity"

export async function POST(req: Request) {
  const { id, file_path } = await req.json()

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

  // validate document ownership
  const { data: doc } = await supabaseAdmin
    .from("document_vault")
    .select("file_path")
    .eq("id", id)
    .eq("firm_id", firm_id)
    .single()

  if (!doc || doc.file_path !== file_path) {
    return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: storageError } = await supabase.storage
    .from("documents-us")
    .remove([file_path])

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { error: dbError } = await supabase
    .from("document_vault")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id).eq("firm_id", firm_id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  await logDocumentActivity({
    document_id: id,
    firm_id: firm_id || null,
    action: "deleted_document",
    metadata: { file_path },
  })

  return NextResponse.json({ success: true })
}
