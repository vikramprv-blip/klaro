import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autoLinkWorkItem } from "@/lib/auto-link-work-item"

function extractText(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    const preferred =
      obj.answer ??
      obj.response ??
      obj.message ??
      obj.result ??
      obj.text ??
      obj.content

    if (typeof preferred === "string") return preferred
    return JSON.stringify(obj)
  }
  return String(payload ?? "")
}

function parseTasks(raw: string): Array<{ title: string; description?: string; priority?: string }> {
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i)
  const candidate = fenced?.[1] ?? raw

  try {
    const parsed = JSON.parse(candidate)
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { tasks?: unknown[] }).tasks)
        ? (parsed as { tasks: unknown[] }).tasks
        : Array.isArray((parsed as { checklist?: unknown[] }).checklist)
          ? (parsed as { checklist: unknown[] }).checklist
          : []

    return list
      .map((item) => {
        if (typeof item === "string") return { title: item.trim() }
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>
          return {
            title: String(obj.title ?? obj.task ?? obj.name ?? "").trim(),
            description: obj.description ? String(obj.description).trim() : "",
            priority: obj.priority ? String(obj.priority).trim().toUpperCase() : "MEDIUM",
          }
        }
        return { title: "" }
      })
      .filter((item) => item.title)
      .slice(0, 20)
  } catch {
    return raw
      .split("\n")
      .map((line) => line.replace(/^\s*[-*0-9.)]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 20)
      .map((title) => ({ title, priority: "MEDIUM" }))
  }
}

function normalizePriority(priority?: string) {
  const value = String(priority || "MEDIUM").toUpperCase()
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH") return value
  return "MEDIUM"
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const workItem = await prisma.workItem.findUnique({
      where: { id },
      include: {
        client: true,
      },
    })

    if (!workItem) {
      return NextResponse.json({ error: "Work item not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const question = [
      "Generate 5 to 8 concrete checklist tasks for this work item.",
      "Use linked documents first. If there are no linked documents, fallback to client documents.",
      "Return JSON only in this exact shape:",
      '{"tasks":[{"title":"","description":"","priority":"LOW|MEDIUM|HIGH"}]}',
      "Keep titles short and actionable.",
      "Keep descriptions to one sentence.",
    ].join(" ")

    const aiRes = await fetch(`${baseUrl}/api/chat/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        workItemId: id,
      }),
      cache: "no-store",
    })

    const aiData = await aiRes.json().catch(() => ({}))

    if (!aiRes.ok) {
      return NextResponse.json(
        { error: typeof aiData?.error === "string" ? aiData.error : "AI generation failed" },
        { status: 500 }
      )
    }

    const raw = extractText(aiData)
    const tasks = parseTasks(raw)

    if (!tasks.length) {
      return NextResponse.json({ error: "No tasks generated", raw }, { status: 422 })
    }

    const created = []

    for (const task of tasks) {
      const item = await prisma.workItem.create({
        data: {
          title: task.title,
          description: task.description || null,
          priority: normalizePriority(task.priority) as any,
          status: "TODO" as any,
          clientId: workItem.clientId,
        },
      })
      await autoLinkWorkItem(item.id)
      created.push(item)
    }

    return NextResponse.json({
      ok: true,
      count: created.length,
      items: created.map((item) => ({
        id: item.id,
        title: item.title,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    )
  }
}
