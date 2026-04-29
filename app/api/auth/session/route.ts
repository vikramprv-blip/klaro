import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ authenticated: false, user: null })
    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email, ...user.user_metadata }
    })
  } catch {
    return NextResponse.json({ authenticated: false, user: null })
  }
}
