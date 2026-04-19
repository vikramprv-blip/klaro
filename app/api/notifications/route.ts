import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || "me"

    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      userId,
      message: "Notifications table not available yet",
    })
  } catch (error) {
    console.error("NOTIFICATIONS_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    )
  }
}
