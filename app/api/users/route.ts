import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      users: [],
      message: "User table not available yet",
    })
  } catch (error) {
    console.error("USERS_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    )
  }
}
