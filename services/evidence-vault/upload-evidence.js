import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { sha256File } from "./hash.js";
import { generate65BCertificate } from "./certificate.js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const filePath = process.argv[2];
const firmId = process.argv[3];
const matterId = process.argv[4];
const uploadedBy = process.argv[5] || null;

if (!filePath || !firmId || !matterId) {
  console.error("Usage: node upload-evidence.js <filePath> <firmId> <matterId> [uploadedBy]");
  process.exit(1);
}

const filename = path.basename(filePath);
const fileHash = sha256File(filePath);
const storagePath = `${firmId}/${matterId}/${Date.now()}-${filename}`;
const buffer = fs.readFileSync(filePath);

const upload = await supabase.storage
  .from("lawyer-evidence")
  .upload(storagePath, buffer, {
    contentType: "application/octet-stream",
    upsert: false
  });

if (upload.error) {
  console.error(upload.error);
  process.exit(1);
}

const evidenceInsert = await supabase
  .from("lawyer_evidence_vault")
  .insert({
    firm_id: firmId,
    matter_id: matterId,
    file_path: storagePath,
    original_filename: filename,
    file_hash: fileHash,
    file_size_bytes: buffer.length,
    hash_algorithm: "sha256",
    uploaded_by: uploadedBy,
    integrity_status: "verified",
    last_verified_at: new Date().toISOString()
  })
  .select("*")
  .single();

if (evidenceInsert.error) {
  console.error(evidenceInsert.error);
  process.exit(1);
}

const evidence = evidenceInsert.data;

await supabase.from("lawyer_secure_file_events").insert({
  firm_id: firmId,
  evidence_id: evidence.id,
  actor_id: uploadedBy,
  event_type: "evidence_uploaded",
  metadata: {
    file_path: storagePath,
    sha256: fileHash,
    original_filename: filename
  }
});

const certificateText = generate65BCertificate({
  originalFilename: filename,
  fileHash,
  uploadedAt: evidence.uploaded_at
});

const pdfPath = `certificate-${Date.now()}.pdf`;
fs.writeFileSync("certificate-text.txt", certificateText);
execSync(`python3 generate-pdf.py certificate-text.txt ${pdfPath}`);

const pdfBuffer = fs.readFileSync(pdfPath);
const certificateStoragePath = `certificates/${firmId}/${matterId}/${Date.now()}-${filename}.pdf`;

const pdfUpload = await supabase.storage
  .from("lawyer-evidence")
  .upload(certificateStoragePath, pdfBuffer, {
    contentType: "application/pdf",
    upsert: false
  });

if (pdfUpload.error) {
  console.error(pdfUpload.error);
  process.exit(1);
}

await supabase.from("lawyer_evidence_certificates").insert({
  firm_id: firmId,
  evidence_id: evidence.id,
  certificate_text: certificateText,
  generated_by: uploadedBy,
  status: "draft"
});

console.log("Evidence uploaded successfully");
console.log("Evidence ID:", evidence.id);
console.log("SHA-256:", fileHash);
console.log("Certificate PDF:", certificateStoragePath);
