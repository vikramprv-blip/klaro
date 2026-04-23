import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { BlockerActions } from "@/components/blocker-actions"

export const dynamic = "force-dynamic"

function extractBlocker(description: string | null) {
  if (!description) return null

  const match = description.match(/Blockers:\s*([\s\S]*?)(?:\n\n|$)/i)
  if (!match) return null

  const blocker = match[1]?.trim()
  return blocker || null
}

function ageDays(createdAt: Date) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  )
}

export default async function BlockersPage() {
  const items = await prisma.workItem.findMany({
    where: {
      description: {
        contains: "Blockers:",
        mode: "insensitive",
      },
    },
    include: {
      client: true,
    },
    orderBy: [
      { priority: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
    take: 200,
  })

  const blockers = items.map((item) => ({
    ...item,
    blocker: extractBlocker(item.description),
    ageDays: ageDays(item.createdAt),
  }))

  const high = blockers.filter((item) => item.priority === "HIGH")
  const medium = blockers.filter((item) => item.priority === "MEDIUM")
  const low = blockers.filter((item) => item.priority === "LOW")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blocker Escalation</h1>
        <p className="text-sm text-gray-500">
          Review blocked work, escalate priority, and jump directly to the task.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">High priority blockers</div>
          <div className="mt-1 text-2xl font-semibold">{high.length}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Medium priority blockers</div>
          <div className="mt-1 text-2xl font-semibold">{medium.length}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Low priority blockers</div>
          <div className="mt-1 text-2xl font-semibold">{low.length}</div>
        </div>
      </div>

      <div className="space-y-6">
        {[
          { label: "HIGH", items: high },
          { label: "MEDIUM", items: medium },
          { label: "LOW", items: low },
        ].map((group) => (
          <div key={group.label} className="space-y-3">
            <h2 className="text-lg font-medium">{group.label} Priority</h2>

            {group.items.length === 0 ? (
              <div className="rounded-xl border p-4 text-sm text-gray-500">
                No blockers in this priority bucket.
              </div>
            ) : (
              group.items.map((item) => (
                <div key={item.id} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">
                        {item.status} • {item.priority} • {item.client?.name || "No client"} • age {item.ageDays}d
                      </div>
                    </div>

                    <Link href={`/work-items/${item.id}`} className="text-sm underline">
                      Open
                    </Link>
                  </div>

                  {item.blocker ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <span className="font-medium">Blocker:</span> {item.blocker}
                    </div>
                  ) : null}

                  <BlockerActions workItemId={item.id} />
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
