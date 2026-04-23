import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateFollowups } from "@/lib/ai/generate-followups"
import { matchFollowupOwner } from "@/lib/ai/match-followup-owner"

function normalizeDueDate(value: string | null | undefined) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function POST(req: NextRequest) {
  try {
    const { workItemId, assignments } = await req.json()

    if (!workItemId || typeof workItemId !== "string") {
      return NextResponse.json({ error: "workItemId is required" }, { status: 400 })
    }

    const item = await prisma.workItem.findUnique({
      where: { id: workItemId },
      include: {
        client: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Work item not found" }, { status: 404 })
    }

    const followups = await generateFollowups({
      title: item.title,
      description: item.description,
    })

    if (!followups.length) {
      return NextResponse.json({
        created: [],
        count: 0,
      })
    }

    const assignmentMap = new Map<string, string | null>()
    if (assignments && typeof assignments === "object") {
      for (const [key, value] of Object.entries(assignments)) {
        assignmentMap.set(key, typeof value === "string" && value ? value : null)
      }
    }

    const created = []

    for (let index = 0; index < followups.length; index++) {
      const followup = followups[index]
      const followupId = `followup-${index + 1}`

      let assigneeId = assignmentMap.has(followupId)
        ? assignmentMap.get(followupId) ?? null
        : null

      if (!assigneeId) {
        const ownerMatch = await matchFollowupOwner(followup.owner)
        assigneeId = ownerMatch.assignedToId
      }

      const createdItem = await prisma.workItem.create({
        data: {
          title: followup.title,
          description: [
            `Generated from work item: ${item.title}`,
            followup.owner ? `Suggested owner: ${followup.owner}` : null,
            followup.blockers ? `Blockers: ${followup.blockers}` : null,
          ]
            .filter(Boolean)
            .join("\n\n"),
          priority: followup.priority,
          status: "TODO",
          dueDate: normalizeDueDate(followup.dueDate),
          clientId: item.clientId ?? null,
          assigneeId,
        },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      })

      created.push(createdItem)
    }

    return NextResponse.json({
      created,
      count: created.length,
    })
  } catch (error) {
    console.error("create-from-work-item error", error)
    return NextResponse.json({ error: "Failed to create follow-up tasks" }, { status: 500 })
  }
}
