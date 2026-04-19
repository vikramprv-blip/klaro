import { NextResponse } from "next/server"

export async function POST() {
  try {
    return NextResponse.json({
      ok: true,
      updatedCount: 0,
      message: "Notifications table not available yet",
    })
  } catch (error) {
    console.error("MARK_ALL_READ_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    )
  }
}
