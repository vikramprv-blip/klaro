import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
  })

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  if (doc.filePath) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.filePath])

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 })
    }
  }

  await prisma.document.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
