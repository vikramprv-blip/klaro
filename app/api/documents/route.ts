import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { supabaseAdmin } from "@/lib/supabase"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    const file = form.get("file") as File
    const clientId = form.get("clientId") as string | null

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filePath = `documents/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: file.type,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("documents")
      .getPublicUrl(filePath)

    const doc = await prisma.document.create({
      data: {
        filename: file.name,
        content: "",
        fileUrl: urlData.publicUrl,
        filePath,
        clientId: clientId || null,
      },
    })

    return NextResponse.json({
      ok: true,
      document: doc,
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
