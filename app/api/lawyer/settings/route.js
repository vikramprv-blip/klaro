import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await supabase
    .from("firms")
    .select("*")
    .eq("id", DEMO_FIRM)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const { name, address, city, state, pincode, phone, email, gst_number, bar_council, admin_name } = body;

  const { data, error } = await supabase
    .from("firms")
    .update({ name, address, city, state, pincode, phone, email, gst_number, bar_council, admin_name, updated_at: new Date().toISOString() })
    .eq("id", DEMO_FIRM)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
