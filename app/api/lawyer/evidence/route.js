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
      last_verified_at,
      lawyer_matters (
        title,
        client_name,
        court_name
      ),
      lawyer_evidence_certificates (
        certificate_file_path
      )
    `)
    .order("uploaded_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const formatted = data.map(item => ({
    ...item,
    matter_title: item.lawyer_matters?.title,
    client_name: item.lawyer_matters?.client_name,
    court_name: item.lawyer_matters?.court_name,
    certificate_file_path: item.lawyer_evidence_certificates?.[0]?.certificate_file_path
  }));

  return NextResponse.json({ evidence: formatted });
}
