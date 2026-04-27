import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FIRM_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await supabase
    .from("evidence_files")
    .select("*, legal_matters(matter_title, client_name, cnr_number)")
    .eq("firm_id", FIRM_ID)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const matter_id = formData.get("matter_id");
  const firm_id = formData.get("firm_id") || FIRM_ID;

  if (!file || !matter_id) {
    return NextResponse.json({ error: "file and matter_id required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256_hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const file_name = file.name;
  const mime_type = file.type;
  const file_size = buffer.length;
  const file_path = `evidence/${firm_id}/${matter_id}/${Date.now()}-${file_name}`;

  // Upload to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from("lawyer-evidence")
    .upload(file_path, buffer, { contentType: mime_type, upsert: false });

  // If storage bucket missing, still save metadata
  const { data, error } = await supabase
    .from("evidence_files")
    .insert([{ matter_id, firm_id, file_name, file_path, sha256_hash, file_size, mime_type, verified: false }])
    .select("*, legal_matters(matter_title, client_name, cnr_number)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
