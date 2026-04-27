import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logDocumentActivity } from "@/app/api/us/documents/_lib/log-document-activity"

export async function POST(req: Request) {
  const { id, file_path, firm_id } = await req.json()

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
    .eq("id", id)

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
