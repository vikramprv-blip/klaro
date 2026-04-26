import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/jpg": "JPG",
};

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await req.formData();
    const clientId = String(formData.get("clientId") || "").trim() || null;
    const clientName = String(formData.get("clientName") || "").trim() || null;
    const category = String(formData.get("category") || "General").trim();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = { imported: 0, failed: 0, errors: [] as string[], documents: [] as any[] };

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const docCategory = ALLOWED_TYPES[file.type];
      if (!docCategory) {
        results.failed++;
        results.errors.push(`${file.name}: unsupported file type (${file.type})`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, buffer, { contentType: file.type, upsert: false });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);

        const doc = await prisma.documents.create({
          data: {
            title: file.name.replace(/\.[^.]+$/, ""),
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: BigInt(file.size),
            file_type: file.type,
            doc_category: category || docCategory,
            client_id: clientId ? (clientId as any) : null,
            notes: clientName ? `Uploaded for ${clientName}` : null,
          },
          select: { id: true, title: true, file_url: true },
        });

        results.imported++;
        results.documents.push(doc);
      } catch (e: any) {
        results.failed++;
        results.errors.push(`${file.name}: ${e.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
