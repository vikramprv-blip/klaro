import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { evidenceId } = await req.json();

  const { data: evidence, error } = await supabase
    .from("lawyer_evidence_vault")
    .select("*")
    .eq("id", evidenceId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const downloaded = await supabase.storage
    .from(evidence.storage_bucket || "lawyer-evidence")
    .download(evidence.file_path);

  if (downloaded.error) {
    return NextResponse.json({ error: downloaded.error.message }, { status: 500 });
  }

  const arrayBuffer = await downloaded.data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const currentHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const verified = currentHash === evidence.file_hash;

  await supabase
    .from("lawyer_evidence_vault")
    .update({
      integrity_status: verified ? "verified" : "tampered",
      last_verified_at: new Date().toISOString()
    })
    .eq("id", evidenceId);

  await supabase.from("lawyer_secure_file_events").insert({
    firm_id: evidence.firm_id,
    evidence_id: evidence.id,
    actor_id: null,
    event_type: verified ? "evidence_verified" : "evidence_tamper_detected",
    metadata: {
      expected_hash: evidence.file_hash,
      current_hash: currentHash
    }
  });

  return NextResponse.json({
    verified,
    expected_hash: evidence.file_hash,
    current_hash: currentHash
  });
}
