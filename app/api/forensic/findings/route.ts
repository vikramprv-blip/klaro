import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const engagement_id = searchParams.get("engagement_id");
  let q = sb.from("forensic_findings").select("*").order("created_at", { ascending: false });
  if (engagement_id) q = q.eq("engagement_id", engagement_id);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const count = (await sb.from("forensic_findings").select("id", { count: "exact", head: true }).eq("engagement_id", body.engagement_id)).count || 0;
  const finding_no = `F-${String(Number(count) + 1).padStart(3, "0")}`;
  const { data, error } = await sb.from("forensic_findings").insert([{ ...body, finding_no }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await sb.from("forensic_findings").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
