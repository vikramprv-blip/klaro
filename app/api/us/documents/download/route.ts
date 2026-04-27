import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { logDocumentActivity } from "@/app/api/us/documents/_lib/log-document-activity"

export async function POST(req: Request) {
  const { file_path, id } = await req.json()

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

  const { data, error } = await supabase.storage
    .from("documents-us")
    .createSignedUrl(file_path, 60, {
      download: true,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logDocumentActivity({
    document_id: id || null,
    firm_id: firm_id || null,
    action: "downloaded_document",
    metadata: { file_path },
  })

  return NextResponse.json({ url: data.signedUrl })
}
