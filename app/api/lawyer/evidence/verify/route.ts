import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req: Request) {
  const { id, file_content_b64 } = await req.json();
  const { data } = await sb.from("evidence_files").select("sha256_hash, file_name").eq("id", id).single();
  if (!data) return NextResponse.json({ verified: false, error: "Not found" }, { status: 404 });
  const computed = createHash("sha256").update(Buffer.from(file_content_b64, "base64")).digest("hex");
  return NextResponse.json({ verified: computed === data.sha256_hash, stored_hash: data.sha256_hash, computed_hash: computed });
}
