import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({ ok: true, count: result.count })
  } catch (error) {
    console.error("mark-all-read failed", error)
    return NextResponse.json({ ok: false, error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
