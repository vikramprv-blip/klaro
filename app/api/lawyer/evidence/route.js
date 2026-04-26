import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("lawyer_evidence_vault")
    .select(`
      id,
      firm_id,
      matter_id,
      original_filename,
      file_hash,
      integrity_status,
      uploaded_at,
      last_verified_at
    `)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ evidence: data });
}
