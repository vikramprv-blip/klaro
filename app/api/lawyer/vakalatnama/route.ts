import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await supabase
    .from("vakalatnamas")
    .select("*, legal_matters(matter_title, client_name)")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vakalatnamas: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, client_name, client_address, advocate_name, bar_number, court_name, case_number, case_type, opposite_party, date_signed } = body;
  const { data, error } = await supabase
    .from("vakalatnamas")
    .insert([{ firm_id: FIRM, matter_id, client_name, client_address, advocate_name, bar_number, court_name, case_number, case_type, opposite_party, date_signed }])
    .select("*, legal_matters(matter_title, client_name)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  const { data, error } = await supabase.from("vakalatnamas").update({ status }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
