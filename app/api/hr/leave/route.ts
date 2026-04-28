import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || "demo-org";
  const { data } = await sb.from("LeaveRequest").select("*, Employee(name)").eq("orgId", orgId).order("createdAt", { ascending: false });
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await sb.from("LeaveRequest").insert([body]).select().single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, leave: data });
}
export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  const { data, error } = await sb.from("LeaveRequest").update({ status }).eq("id", id).select().single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, leave: data });
}
