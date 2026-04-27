import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matter_id = searchParams.get("matter_id");
  let query = supabase.from("lawyer_time_entries")
    .select("*, legal_matters(matter_title, client_name), users(full_name)")
    .eq("firm_id", FIRM)
    .order("date", { ascending: false });
  if (matter_id) query = query.eq("matter_id", matter_id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalHours = data?.reduce((s, e) => s + Number(e.hours), 0) || 0;
  const totalAmount = data?.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const unbilledAmount = data?.filter(e => !e.billed).reduce((s, e) => s + Number(e.amount), 0) || 0;
  return NextResponse.json({ entries: data || [], totalHours, totalAmount, unbilledAmount });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, date, hours, rate_per_hour, description, billable } = body;
  const { data, error } = await supabase
    .from("lawyer_time_entries")
    .insert([{ firm_id: FIRM, matter_id, date, hours, rate_per_hour: rate_per_hour || 0, description, billable: billable !== false }])
    .select("*, legal_matters(matter_title, client_name)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, billed } = await req.json();
  const { data, error } = await supabase.from("lawyer_time_entries").update({ billed }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
