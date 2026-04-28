import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { data: file } = await sb.from("evidence_files").select("*, legal_matters(matter_title, client_name)").eq("id", id).single();
  const { data: firm } = await sb.from("firms").select("name, address, admin_name").eq("id", FIRM).single();
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const cert = {
    certificate_type: "Section 65B Certificate",
    issued_by: firm?.name || "Klaro Demo Firm",
    issued_by_admin: firm?.admin_name || "Vikram Chawla",
    file_name: file.file_name,
    file_size: file.file_size,
    file_type: file.file_type,
    sha256_hash: file.sha256_hash,
    upload_date: file.created_at,
    matter: file.legal_matters?.matter_title || "—",
    client: file.legal_matters?.client_name || "—",
    certification_statement: "I hereby certify that the electronic record described above was produced by me and that the information contained in this certificate is true to the best of my knowledge and belief. This certificate is issued under Section 65B(4) of the Indian Evidence Act, 1872.",
    date_of_certificate: new Date().toISOString().split("T")[0],
  };
  await sb.from("evidence_files").update({ certificate_url: `/api/lawyer/evidence/certificate?id=${id}`, updated_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json(cert);
}
