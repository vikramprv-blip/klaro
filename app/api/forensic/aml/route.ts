import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const engagement_id = searchParams.get("engagement_id");
  let q = sb.from("forensic_aml_checks").select("*").order("created_at", { ascending: false });
  if (engagement_id) q = q.eq("engagement_id", engagement_id);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const hasMatch = body.pep_check === "match_found" || body.sanctions_check === "match_found" || body.adverse_media === "match_found";
  const risk_level = hasMatch ? "critical" : body.pep_check === "review_required" || body.sanctions_check === "review_required" ? "high" : "low";
  const { data, error } = await sb.from("forensic_aml_checks").insert([{ ...body, risk_level }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
