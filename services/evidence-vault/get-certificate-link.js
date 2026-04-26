import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const certificatePath = process.argv[2];
const expirySeconds = Number(process.argv[3] || 3600);

if (!certificatePath) {
  console.error("Usage: node get-certificate-link.js <certificateStoragePath> [expirySeconds]");
  process.exit(1);
}

const { data, error } = await supabase.storage
  .from("lawyer-evidence")
  .createSignedUrl(certificatePath, expirySeconds);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log("Signed certificate link:");
console.log(data.signedUrl);
console.log("Expires in seconds:", expirySeconds);
