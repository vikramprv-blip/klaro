import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkItemStatusForm from "@/components/work-item-status-form"
import WorkItemEditForm from "@/components/work-item-edit-form"
import WorkItemAssigneeForm from "@/components/work-item-assignee-form"
import WorkItemMetaForm from "@/components/work-item-meta-form"
import WorkItemDangerZone from "@/components/work-item-danger-zone"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function WorkItemDetailPage({ params }: PageProps) {
  const { id } = await params

  const [item, users] = await Promise.all([
    prisma.workItem.findUnique({
      where: { id },
      include: {
        client: true,
        assignments: {
          include: {
            user: true,
          },
        },
        documents: true,
        invoice: true,
      },
    }),
    prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ])

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
            {item.filingType} • {item.periodLabel} • {item.status}
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
              <WorkItemStatusForm id={item.id} value={item.status} />
            </div>

            <div>
              <WorkItemAssigneeForm
                id={item.id}
                value={item.assignments[0]?.userId ?? ""}
                users={users}
              />
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
            <h2 className="mb-3 text-lg font-semibold">Assignments</h2>
            <div className="space-y-3">
              {item.assignments.length ? (
                item.assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border p-3">
                    <div className="font-medium">{assignment.user?.name ?? "Unassigned"}</div>
                    <div className="text-sm text-gray-500">{assignment.role}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No assignments yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Documents</h2>
            <div className="space-y-3">
              {item.documents.length ? (
                item.documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border p-3">
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-500">{doc.status}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No documents yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Invoice</h2>
            {item.invoice ? (
              <div className="rounded-lg border p-3">
                <div className="font-medium">{item.invoice.invoiceNo}</div>
                <div className="text-sm text-gray-500">{item.invoice.status}</div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No invoice linked.</p>
            )}
          </section>
        </aside>
      </div>

      <div className="mt-6">
        <WorkItemDangerZone id={item.id} isArchived={!!item.archivedAt} />
      </div>

    </main>
  )
}
