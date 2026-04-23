import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const file = formData.get("file") as File | null
    const client_id = formData.get("client_id") as string | null
    const document_type = (formData.get("document_type") as string | null) || "Other"

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const file_path = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(file_path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(file_path)

    const document = await prisma.documents.create({
      data: {
        title: file.name.replace(/\.[^.]+$/, "") || "Untitled Document",
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_size: BigInt(file.size),
        file_type: file.type || null,
        doc_category: document_type,
        client_id: client_id || null,
      },
    })

    return NextResponse.json({
      document: {
        ...document,
        file_size: document.file_size?.toString?.() ?? null,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
