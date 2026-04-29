import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  const { data: engagements, error } = await sb
    .from("forensic_engagements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = engagements?.length || 0;
  const planning = engagements?.filter(e => e.status === "planning").length || 0;
  const fieldwork = engagements?.filter(e => e.status === "fieldwork").length || 0;
  const completed = engagements?.filter(e => e.status === "completed").length || 0;
  const critical = engagements?.filter(e => e.risk_rating === "critical").length || 0;
  const totalFees = engagements?.reduce((s, e) => s + Number(e.fee_estimate || 0), 0) || 0;

  return NextResponse.json({
    engagements: engagements || [],
    stats: { total, planning, fieldwork, completed, critical, totalFees }
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const count = (await sb.from("forensic_engagements").select("id", { count: "exact", head: true })).count || 0;
  const engagement_no = `FA-${new Date().getFullYear()}-${String(Number(count) + 1).padStart(4, "0")}`;
  const { data, error } = await sb
    .from("forensic_engagements")
    .insert([{ ...body, engagement_no, status: "planning" }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await sb
    .from("forensic_engagements")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
