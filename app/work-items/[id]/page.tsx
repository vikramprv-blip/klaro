export const dynamic = "force-dynamic";
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkItemStatusForm from "@/components/work-item-status-form"
import WorkItemEditForm from "@/components/work-item-edit-form"
import WorkItemMetaForm from "@/components/work-item-meta-form"
import WorkItemDangerZone from "@/components/work-item-danger-zone"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function WorkItemDetailPage({ params }: PageProps) {
  const { id } = await params

  const item = await prisma.workItem.findUnique({
    where: { id },
    include: {
      client: true,
    },
  })

  if (!item) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            <Link href="/workboard" className="hover:underline">
              Workboard
            </Link>
            <span className="mx-2">/</span>
            <span>{item.title}</span>
          </div>
          <h1 className="text-3xl font-semibold">{item.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {item.status}
          </p>
        </div>

        <Link
          href="/workboard"
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Workboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Overview</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-gray-500">Client</div>
              <div className="mt-1 font-medium">{item.client?.name ?? "—"}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Priority</div>
              <div className="mt-1 font-medium">{item.priority ?? "MEDIUM"}</div>
            </div>

            <div>
              <WorkItemStatusForm id={item.id} value={item.status} />
            </div>

            <div>
              <div className="text-sm text-gray-500">Due date</div>
              <div className="mt-1 font-medium">
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}
              </div>
            </div>

            <div className="sm:col-span-2">
              <WorkItemMetaForm
                id={item.id}
                dueDate={item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : ""}
                priority={item.priority ?? "MEDIUM"}
              />
            </div>

            <div className="sm:col-span-2">
              <WorkItemEditForm
                id={item.id}
                title={item.title}
                description={item.description}
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">{item.status}</div>
              </div>
              <div>
                <div className="text-gray-500">Priority</div>
                <div className="font-medium">{item.priority}</div>
              </div>
              <div>
                <div className="text-gray-500">Created</div>
                <div className="font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Last updated</div>
                <div className="font-medium">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Description</h2>
            {item.description ? (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {item.description}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No description added.</p>
            )}
          </section>
        </aside>
      </div>

      <div className="mt-6">
        <WorkItemDangerZone id={item.id} isArchived={false} />
      </div>
    </main>
  )
}
