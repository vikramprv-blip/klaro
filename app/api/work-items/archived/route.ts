import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    return NextResponse.json({
      items: [],
      message: "Archived work items are not available because archivedAt is not in the current schema",
    })
  } catch (error) {
    console.error("ARCHIVED_WORK_ITEMS_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load archived work items" },
      { status: 500 }
    )
  }
}
