import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function MyWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; status?: string }>
}) {
  const params = await searchParams
  const userId = params.userId
  const status = params.status

  const items = await prisma.workItem.findMany({
    where: {
      ...(userId ? { assigneeId: userId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      client: true,
      assignee: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Work</h1>
        <p className="text-sm text-gray-500">
          {userId ? `Showing work for assignee ${userId}.` : "Showing all work items."}
        </p>
      </div>

      <div className="flex gap-2 text-sm">
        <Link href={userId ? `/my-work?userId=${userId}` : `/my-work`} className="rounded border px-3 py-1.5">
          All
        </Link>
        <Link
          href={userId ? `/my-work?userId=${userId}&status=TODO` : `/my-work?status=TODO`}
          className="rounded border px-3 py-1.5"
        >
          TODO
        </Link>
        <Link
          href={userId ? `/my-work?userId=${userId}&status=IN_PROGRESS` : `/my-work?status=IN_PROGRESS`}
          className="rounded border px-3 py-1.5"
        >
          In Progress
        </Link>
        <Link
          href={userId ? `/my-work?userId=${userId}&status=DONE` : `/my-work?status=DONE`}
          className="rounded border px-3 py-1.5"
        >
          Done
        </Link>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border p-4 text-sm text-gray-500">No work items found.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">
                    {item.priority} • {item.status} • {item.assignee?.email || "Unassigned"}
                  </div>
                </div>
                <Link href={`/work-items/${item.id}`} className="text-sm underline">
                  Open
                </Link>
              </div>
              {item.description ? <p className="mt-2 text-sm text-gray-600">{item.description}</p> : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
