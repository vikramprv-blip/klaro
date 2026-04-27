import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await supabase
    .from("client_portal_invites")
    .select("*")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invites: data || [] });
}

export async function POST(req: Request) {
  const { client_name, client_email } = await req.json();
  if (!client_name || !client_email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });

  const { data, error } = await supabase
    .from("client_portal_invites")
    .upsert([{ firm_id: FIRM, client_name, client_email, status: "invited" }], { onConflict: "firm_id,client_email" })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from("client_portal_invites").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
