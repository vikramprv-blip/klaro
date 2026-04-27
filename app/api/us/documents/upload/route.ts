import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const formData = await req.formData()

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userData } = await supabase
    .from("users")
    .select("firm_id")
    .eq("id", user.id)
    .single()

  if (!userData?.firm_id) {
    return new Response(JSON.stringify({ error: "No firm found" }), { status: 400 })
  }

  const firm_id = userData.firm_id

  const { data: firm } = await supabase
    .from("us_firms")
    .select("storage_limit_mb")
    .eq("id", firm_id)
    .single()

  // storage limit check
  const { data: files } = await supabase
    .from("document_vault")
    .select("file_size")
    .eq("firm_id", firm_id)
    .is("deleted_at", null)

  const used = (files || []).reduce((sum, f) => sum + (f.file_size || 0), 0)
  const limit = (firm?.storage_limit_mb ?? 1024) * 1024 * 1024

  if (used > limit) {
    return new Response(JSON.stringify({ error: "Storage limit reached" }), { status: 402 })
  }

  formData.set("firm_id", firm_id)

  const authHeader = req.headers.get("authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }




  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-document`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status })
  }

  return NextResponse.json(data)
}
