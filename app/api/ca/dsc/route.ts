import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

const CAS = ["eMudhra", "NSDL e-Governance", "Sify Technologies", "CDAC", "MTNL Trustline", "SafeScrypt", "(n)Code Solutions"];
const PURPOSES = ["Income Tax Filing", "MCA / ROC Filing", "GST Portal", "EPFO", "TRACES", "Tender Portal", "Other"];
const DSC_CLASSES = ["Class 2", "Class 3", "Class 3 with Encryption"];

function daysToExpiry(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export async function GET() {
  const { data, error } = await supabase
    .from("dsc_records").select("*").eq("firm_id", FIRM)
    .order("expiry_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const records = (data || []).map(r => ({
    ...r,
    days_to_expiry: daysToExpiry(r.expiry_date),
    urgency: daysToExpiry(r.expiry_date) < 0 ? "expired"
           : daysToExpiry(r.expiry_date) <= 7 ? "critical"
           : daysToExpiry(r.expiry_date) <= 30 ? "warning"
           : "ok"
  }));

  const stats = {
    total: records.length,
    expired: records.filter(r => r.urgency === "expired").length,
    critical: records.filter(r => r.urgency === "critical").length,
    warning: records.filter(r => r.urgency === "warning").length,
    ok: records.filter(r => r.urgency === "ok").length,
  };

  return NextResponse.json({ records, stats, cas: CAS, purposes: PURPOSES, classes: DSC_CLASSES });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { client_name, holder_name, pan, dsc_class, purposes, certifying_authority, serial_number, issue_date, expiry_date, token_provider, email_on_dsc, notes } = body;
  const { data, error } = await supabase
    .from("dsc_records")
    .insert([{ firm_id: FIRM, client_name, holder_name, pan, dsc_class, purposes: purposes || [], certifying_authority, serial_number, issue_date, expiry_date, token_provider, email_on_dsc, notes }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { data, error } = await supabase
    .from("dsc_records").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from("dsc_records").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
