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
  // Basic FATF screening logic — in production integrate LexisNexis Bridger Insight
  const { entity_name, entity_type, country, id_number } = body;
  const riskFactors = [];
  if (["Iran","North Korea","Syria","Russia","Belarus","Myanmar"].includes(country)) riskFactors.push("High-risk jurisdiction");
  if (body.pep_check === "match_found") riskFactors.push("PEP match");
  const risk_level = riskFactors.length > 1 ? "high" : riskFactors.length === 1 ? "medium" : "low";
  const { data, error } = await sb.from("forensic_aml_checks").insert([{
    ...body, risk_level, checked_at: new Date().toISOString()
  }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await sb.from("forensic_aml_checks").update({ ...updates, checked_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
