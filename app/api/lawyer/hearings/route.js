import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("lawyer_matters")
    .select("id, title, client_name, court_name, next_hearing_date")
    .eq("next_hearing_date", today);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ hearings: data || [] });
}
