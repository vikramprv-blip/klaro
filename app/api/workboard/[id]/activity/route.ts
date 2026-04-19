import { NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params

    return NextResponse.json({
      workItemId: id,
      activity: [],
      message: "Work item activity table not available yet",
    })
  } catch (error) {
    console.error("WORKBOARD_ACTIVITY_GET_ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load work item activity" },
      { status: 500 }
    )
  }
}
