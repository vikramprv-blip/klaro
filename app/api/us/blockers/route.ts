import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await sb.from("us_blockers").select("*").eq("firm_id", FIRM).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const blockers = (data || []).map(b => ({
    ...b,
    days_blocked: Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000),
    escalated: Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000) > 3,
  }));

  const stats = {
    total: blockers.length,
    active: blockers.filter(b => b.status === "active").length,
    escalated: blockers.filter(b => b.escalated && b.status === "active").length,
    resolved: blockers.filter(b => b.status === "resolved").length,
    critical: blockers.filter(b => b.severity === "critical" && b.status === "active").length,
  };

  return NextResponse.json({ blockers, stats });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, blocked_by_firm, blocking_firm, severity, deadline } = body;
  const { data, error } = await sb.from("us_blockers").insert([{
    firm_id: FIRM, title, description, blocked_by_firm, blocking_firm,
    severity: severity || "medium", deadline: deadline || null, status: "active"
  }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, status, ...updates } = await req.json();
  const patch: any = { ...updates, updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (status === "resolved") patch.resolved_at = new Date().toISOString();
  const { data, error } = await sb.from("us_blockers").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
