import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {

  const url = new URL(req.url)
  const firm_id = url.searchParams.get("firm_id")

  const { query } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("us_documents_view")
    .select("*")
    .eq("firm_id", firm_id)
    .is("deleted_at", null)
    .ilike("title", `%${query || ""}%`)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data || [] })
}
