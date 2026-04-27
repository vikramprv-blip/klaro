import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

const ROC_TYPES = [
  { type: "Annual Return", form: "MGT-7/MGT-7A", days_after_agm: 60, description: "Annual return filing after AGM" },
  { type: "Financial Statements", form: "AOC-4", days_after_agm: 30, description: "Financial statements with Board report" },
  { type: "Board Meeting", form: "MBP-1/MBP-4", days: 0, description: "First board meeting within 30 days of incorporation" },
  { type: "DIR-3 KYC", form: "DIR-3 KYC", due_month: 9, due_day: 30, description: "Director KYC — annual by 30 Sep" },
  { type: "DPT-3", form: "DPT-3", due_month: 6, due_day: 30, description: "Return of deposits — annual by 30 Jun" },
  { type: "MSME Form 1", form: "MSME-1", description: "Half-yearly return for MSME payments" },
  { type: "Charge Filing", form: "CHG-1", days: 30, description: "Filing of charge within 30 days" },
  { type: "Increase in Authorized Capital", form: "SH-7", days: 30, description: "Within 30 days of passing resolution" },
  { type: "Change in Directors", form: "DIR-12", days: 30, description: "Within 30 days of appointment/resignation" },
  { type: "Change in Registered Office", form: "INC-22", days: 30, description: "Within 30 days of change" },
  { type: "AGM Extension", form: "GNL-1", description: "Application for extension of time for AGM" },
  { type: "Commencement of Business", form: "INC-20A", days: 180, description: "Within 180 days of incorporation" },
];

export async function GET() {
  const { data, error } = await supabase
    .from("roc_filings")
    .select("*")
    .eq("firm_id", FIRM)
    .order("due_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pending = data?.filter(r => r.status === "pending").length || 0;
  const overdue = data?.filter(r => r.status === "pending" && r.due_date && new Date(r.due_date) < new Date()).length || 0;
  const filed = data?.filter(r => r.status === "filed").length || 0;

  return NextResponse.json({ filings: data || [], types: ROC_TYPES, stats: { pending, overdue, filed, total: data?.length || 0 } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { client_name, cin, company_type, filing_type, form_number, financial_year, due_date, notes } = body;
  const { data, error } = await supabase
    .from("roc_filings")
    .insert([{ firm_id: FIRM, client_name, cin, company_type, filing_type, form_number, financial_year, due_date, notes }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status, filed_date, challan_number, penalty_amount, notes } = body;
  const { data, error } = await supabase
    .from("roc_filings")
    .update({ status, filed_date, penalty_amount, notes, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
