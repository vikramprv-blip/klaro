import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matter_id = searchParams.get("matter_id");
  let q = sb.from("us_matter_tasks").select("*").order("due_date");
  if (matter_id) q = q.eq("matter_id", matter_id);
  const { data } = await q;
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await sb.from("us_matter_tasks").insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await sb.from("us_matter_tasks").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
