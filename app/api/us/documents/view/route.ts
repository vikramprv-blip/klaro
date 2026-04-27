import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logDocumentActivity } from "@/app/api/us/documents/_lib/log-document-activity"

export async function POST(req: Request) {
  const { file_path, id, firm_id } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.storage
    .from("documents-us")
    .createSignedUrl(file_path, 60)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logDocumentActivity({
    document_id: id || null,
    firm_id: firm_id || null,
    action: "viewed_document",
    metadata: { file_path },
  })

  return NextResponse.json({ url: data.signedUrl })
}
