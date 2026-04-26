import { NextResponse } from "next/server"
import { autoLinkWorkItem } from "@/lib/auto-link-work-item"

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const result = await autoLinkWorkItem(id)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Auto-link failed",
      },
      { status: 500 }
    )
  }
}
