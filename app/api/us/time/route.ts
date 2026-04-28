import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matter_id = searchParams.get("matter_id");
  let q = sb.from("us_time_entries").select("*, us_matters(title, client_name)").eq("firm_id", FIRM).order("date", { ascending: false });
  if (matter_id) q = q.eq("matter_id", matter_id);
  const { data } = await q;
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const amount = Number(body.hours || 0) * Number(body.rate || 0);
  const { data, error } = await sb.from("us_time_entries").insert([{ ...body, firm_id: FIRM, amount }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Update billed hours on matter
  if (body.matter_id) {
    const { data: existing } = await sb.from("us_time_entries").select("hours").eq("matter_id", body.matter_id);
    const total = (existing || []).reduce((s: number, e: any) => s + Number(e.hours || 0), 0);
    await sb.from("us_matters").update({ billed_hours: total }).eq("id", body.matter_id);
  }
  return NextResponse.json(data);
}
