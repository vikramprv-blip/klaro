import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const evidenceId = process.argv[2];

if (!evidenceId) {
  console.error("Usage: node verify-evidence.js <evidenceId>");
  process.exit(1);
}

const { data: evidence, error } = await supabase
  .from("lawyer_evidence_vault")
  .select("*")
  .eq("id", evidenceId)
  .single();

if (error) {
  console.error(error);
  process.exit(1);
}

const downloaded = await supabase.storage
  .from(evidence.storage_bucket || "lawyer-evidence")
  .download(evidence.file_path);

if (downloaded.error) {
  console.error(downloaded.error);
  process.exit(1);
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

console.log(verified ? "Evidence verified" : "Tampering detected");
console.log("Expected:", evidence.file_hash);
console.log("Current:", currentHash);
