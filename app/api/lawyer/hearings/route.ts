import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  const { data, error } = await sb.from("legal_hearings").select("*, legal_matters(matter_title, client_name, cnr_number)").eq("firm_id", FIRM).order("hearing_date", { ascending: true });
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, hearing_date, court_name, purpose, notes, next_date } = body;
  const { data, error } = await sb.from("legal_hearings").insert([{ firm_id: FIRM, matter_id, hearing_date, court_name, purpose, notes, next_date }]).select("*, legal_matters(matter_title, client_name)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await sb.from("legal_hearings").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
