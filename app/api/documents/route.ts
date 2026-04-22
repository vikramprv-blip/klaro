import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const file = formData.get("file") as File | null
  const clientId = formData.get("clientId") as string | null
  const documentType = (formData.get("documentType") as string | null) || "Other"

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filePath = `${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath)

  const document = await prisma.document.create({
    data: {
      filename: file.name,
      fileUrl: publicUrlData.publicUrl,
      filePath,
      clientId: clientId || null,
      documentType,
      content: "",
    },
  })

  return NextResponse.json({ document })
}
