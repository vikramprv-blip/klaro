import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matter_id = searchParams.get("matter_id");
  let query = sb.from("legal_documents").select("*, legal_matters(matter_title, client_name)").eq("firm_id", FIRM).order("created_at", { ascending: false });
  if (matter_id) query = query.eq("matter_id", matter_id);
  const { data, error } = await query;
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await sb.from("legal_documents").insert([{ firm_id: FIRM, ...body }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await sb.from("legal_documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
