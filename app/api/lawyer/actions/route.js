import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("lawyer_action_suggestions")
    .select(`
      id,
      matter_id,
      suggestion_type,
      message,
      status,
      created_at,
      lawyer_matters (
        title,
        client_name,
        court_name,
        next_hearing_date
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ actions: data || [] });
}
