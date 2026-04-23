import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateFollowups } from "@/lib/ai/generate-followups"
import { matchFollowupOwner } from "@/lib/ai/match-followup-owner"

export async function POST(req: NextRequest) {
  try {
    const { workItemId } = await req.json()

    if (!workItemId || typeof workItemId !== "string") {
      return NextResponse.json({ error: "workItemId is required" }, { status: 400 })
    }

    const item = await prisma.workItem.findUnique({
      where: { id: workItemId },
      select: {
        id: true,
        title: true,
        description: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Work item not found" }, { status: 404 })
    }

    const followups = await generateFollowups({
      title: item.title,
      description: item.description,
    })

    const enriched = await Promise.all(
      followups.map(async (followup, index) => {
        const ownerMatch = await matchFollowupOwner(followup.owner)

        return {
          id: `followup-${index + 1}`,
          ...followup,
          assigneeId: ownerMatch.assignedToId,
          matchedUser: ownerMatch.matchedUser,
          ownerMatchConfidence: ownerMatch.confidence,
        }
      })
    )

    return NextResponse.json({ followups: enriched })
  } catch (error) {
    console.error("followups preview error", error)
    return NextResponse.json({ error: "Failed to preview follow-ups" }, { status: 500 })
  }
}
