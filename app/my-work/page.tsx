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

  if (!userId) {
    return <div className="p-6">Missing userId</div>
  }

  const items = await prisma.workItem.findMany({
    where: {
      archivedAt: null,
      ...(status ? { status: status as any } : {}),
      assignments: {
        some: {
          userId,
        },
      },
    },
    include: {
      client: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
    take: 100,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Assigned to you</h1>
          <p className="text-sm text-neutral-500">
            Your active work items in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/my-work?userId=${userId}`}
            className="rounded-md border px-3 py-2"
          >
            All
          </Link>
          <Link
            href={`/my-work?userId=${userId}&status=PENDING`}
            className="rounded-md border px-3 py-2"
          >
            Pending
          </Link>
          <Link
            href={`/my-work?userId=${userId}&status=IN_PROGRESS`}
            className="rounded-md border px-3 py-2"
          >
            In progress
          </Link>
          <Link
            href={`/my-work?userId=${userId}&status=DONE`}
            className="rounded-md border px-3 py-2"
          >
            Done
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-neutral-500">
            No work items found.
          </div>
        ) : (
          items.map((item) => {
            const isOverdue =
              item.dueDate &&
              new Date(item.dueDate) < new Date() &&
              item.status !== "DONE"

            return (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-medium">{item.title}</div>

                    <div className="text-sm text-neutral-600">
                      {item.client?.name || "No client"}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <span className="rounded border px-2 py-1">
                        {item.status}
                      </span>
                      <span className="rounded border px-2 py-1">
                        {item.priority}
                      </span>
                      {item.dueDate ? (
                        <span className="rounded border px-2 py-1">
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      ) : null}
                      {isOverdue ? (
                        <span className="rounded border px-2 py-1">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    href={`/workboard`}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    Open board
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
