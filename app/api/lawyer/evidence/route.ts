import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  const { data, error } = await sb.from("evidence_files").select("*, legal_matters(matter_title, client_name)").eq("firm_id", FIRM).order("created_at", { ascending: false });
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, file_name, file_size, file_type, file_content_b64, notes } = body;
  const sha256_hash = file_content_b64 ? createHash("sha256").update(Buffer.from(file_content_b64, "base64")).digest("hex") : null;
  const { data, error } = await sb.from("evidence_files").insert([{ firm_id: FIRM, matter_id, file_name, file_size, file_type, sha256_hash, notes, status: "active" }]).select("*, legal_matters(matter_title, client_name)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
