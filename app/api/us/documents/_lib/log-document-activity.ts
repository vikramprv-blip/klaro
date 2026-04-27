import { createClient } from "@supabase/supabase-js"

export async function logDocumentActivity({
  document_id,
  firm_id,
  action,
  metadata = {},
}: {
  document_id?: string | null
  firm_id?: string | null
  action: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from("document_activity_logs").insert({
    document_id,
    firm_id,
    action,
    metadata,
  })
}
