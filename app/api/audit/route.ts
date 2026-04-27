import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity_type = searchParams.get("entity_type");
  const user_id = searchParams.get("user_id");
  const limit = Number(searchParams.get("limit") || 100);

  let query = supabase
    .from("audit_logs")
    .select("*, users(full_name, email)")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entity_type) query = query.eq("entity_type", entity_type);
  if (user_id) query = query.eq("user_id", user_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, user_email, action, entity_type, entity_id, entity_name, old_value, new_value, ip_address } = body;

  const { data, error } = await supabase
    .from("audit_logs")
    .insert([{ firm_id: FIRM, user_id, user_email, action, entity_type, entity_id, entity_name, old_value, new_value, ip_address }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
