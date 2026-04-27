import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logDocumentActivity } from "@/app/api/us/documents/_lib/log-document-activity"

export async function POST(req: Request) {
  const { id, title, firm_id } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from("document_vault")
    .update({ title })
    .eq("id", id)

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
