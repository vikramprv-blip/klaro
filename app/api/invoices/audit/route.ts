import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  const { data } = await supabase.from("audit_logs").select("*").eq("entity_type", "invoice").order("created_at", { ascending: false }).limit(20);
  return NextResponse.json({ audit: data || [] });
}
