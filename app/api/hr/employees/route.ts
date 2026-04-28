import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function empCode(name: string) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 3);
  return `EMP-${initials}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || "demo-org";
  const { data, error } = await sb.from("Employee").select("*").eq("orgId", orgId).order("createdAt", { ascending: false });
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = empCode(body.name || "EMP");
  const { data, error } = await sb.from("Employee").insert([{
    id,
    orgId: body.orgId || "demo-org",
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    role: body.role || "Staff",
    department: body.department || "General",
    salary: Number(body.salary || 0),
    status: "active",
  }]).select().single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, employee: data });
}

export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await sb.from("Employee").update({ ...updates, updatedAt: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, employee: data });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await sb.from("Employee").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
