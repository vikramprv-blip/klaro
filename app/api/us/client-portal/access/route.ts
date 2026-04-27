import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const { token } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: link } = await supabase
    .from("client_portal_links")
    .select("document_id, expires_at, revoked_at")
    .eq("token", token)
    .single()

  if (!link) return NextResponse.json({ error: "Invalid link" }, { status: 404 })

  if (link.revoked_at) {
    return NextResponse.json({ error: "Link revoked" }, { status: 403 })
  }

  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 403 })
  }

  const { data: doc } = await supabase
    .from("document_vault")
    .select("file_path")
    .eq("id", link.document_id)
    .single()

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })

  const { data, error } = await supabase.storage
    .from("documents-us")
    .createSignedUrl(doc.file_path, 60)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ url: data.signedUrl })
}
