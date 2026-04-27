import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const { data: invite, error } = await supabase
    .from("client_portal_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !invite) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: "Link expired" }, { status: 410 });

  // Update last viewed
  await supabase.from("client_portal_invites").update({ last_viewed_at: new Date().toISOString(), status: "active" }).eq("id", invite.id);

  // Get firm info
  const { data: firm } = await supabase.from("firms").select("name, email, phone, address, city").eq("id", invite.firm_id).single();

  // Get client filings by email match
  const { data: clients } = await supabase
    .from("ca_clients")
    .select("id, name, pan, gstin, entity_type")
    .ilike("email", invite.client_email)
    .limit(5);

  const clientIds = clients?.map(c => c.id) || [];

  let gst: any[] = [], itr: any[] = [], tds: any[] = [];

  if (clientIds.length > 0) {
    const [gr, ir, tr] = await Promise.all([
      supabase.from("gst_filings").select("return_type,period,due_date,filed_date,status").in("client_id", clientIds).order("due_date", { ascending: false }).limit(10),
      supabase.from("itr_filings").select("assessment_year,itr_form,due_date,filed_date,status,refund_amount").in("client_id", clientIds).order("due_date", { ascending: false }).limit(10),
      supabase.from("tds_filings").select("form_type,quarter,due_date,filed_date,status").in("client_id", clientIds).order("due_date", { ascending: false }).limit(10),
    ]);
    gst = gr.data || [];
    itr = ir.data || [];
    tds = tr.data || [];
  }

  return NextResponse.json({ invite, firm, clients, filings: { gst, itr, tds } });
}
