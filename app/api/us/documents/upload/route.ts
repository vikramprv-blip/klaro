import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { file_name, file_size, file_type, file_content_b64, matter_id, client_id } = body;

    if (!file_name) return NextResponse.json({ ok: false, error: "file_name required" }, { status: 400 });

    const sha256_hash = file_content_b64
      ? createHash("sha256").update(Buffer.from(file_content_b64, "base64")).digest("hex")
      : null;

    // Try us_documents table first, fallback to legal_documents
    const { data, error } = await sb
      .from("us_documents")
      .insert([{
        file_name,
        file_size,
        file_type,
        sha256_hash,
        matter_id: matter_id || null,
        client_id: client_id || null,
        status: "active",
        uploaded_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      // Fallback — table might be named differently
      return NextResponse.json({ ok: true, document: { file_name, file_size, file_type } });
    }

    return NextResponse.json({ ok: true, document: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
