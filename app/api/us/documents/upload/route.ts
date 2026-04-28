import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // get firm
  const { data: userData } = await supabase
    .from("users")
    .select("firm_id")
    .eq("id", user.id)
    .single()

  if (!userData?.firm_id) {
    return NextResponse.json({ error: "No firm found" }, { status: 400 })
  }

  const firm_id = userData.firm_id

  // get billing info
  const { data: firm } = await supabase
    .from("us_firms")
    .select("billing_status, storage_limit_mb, valid_till")
    .eq("id", firm_id)
    .single()

  if (!firm) {
    return NextResponse.json({ error: "Firm not found" }, { status: 400 })
  }

  // billing check
  const validTill = firm.valid_till ? new Date(firm.valid_till).getTime() : null
  const isExpired = validTill !== null && validTill < Date.now()

  if (firm.billing_status !== "active" || isExpired) {
    return NextResponse.json(
      { error: "Billing inactive or expired" },
      { status: 402 }
    )
  }

  // storage usage
  const { data: files } = await supabase
    .from("document_vault")
    .select("file_size")
    .eq("firm_id", firm_id)
    .is("deleted_at", null)

  const used = (files || []).reduce((sum, f) => sum + (f.file_size || 0), 0)
  const limit = (firm.storage_limit_mb ?? 1024) * 1024 * 1024

  if (used > limit) {
    return NextResponse.json(
      { error: "Storage limit reached" },
      { status: 402 }
    )
  }

  // forward to storage function
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
