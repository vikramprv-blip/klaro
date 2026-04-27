import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await supabase
    .from("form16_records")
    .select("*")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { client_name, employee_name, pan, form_type, financial_year, gross_salary, tds_deducted, certificate_no } = body;
  const { data, error } = await supabase
    .from("form16_records")
    .insert([{
      firm_id: FIRM, client_name, employee_name, pan, form_type: form_type || "16",
      financial_year, gross_salary, tds_deducted, certificate_no,
      generated_at: new Date().toISOString(), status: "generated"
    }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  const { data, error } = await supabase.from("form16_records").update({ status }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
