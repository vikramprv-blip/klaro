import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("legal_hearings")
    .select(`
      *,
      legal_matters (
        client_name,
        matter_title,
        cnr_number,
        court
      )
    `)
    .order("hearing_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  const body = await req.json();
  const { matter_id, hearing_date, court_name, purpose, next_date, judge_name } = body;

  if (!matter_id || !hearing_date) {
    return NextResponse.json({ error: "matter_id and hearing_date required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("legal_hearings")
    .insert([{ matter_id, hearing_date, court_name, purpose, next_date, judge_name }])
    .select(`*, legal_matters(client_name, matter_title, cnr_number)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
