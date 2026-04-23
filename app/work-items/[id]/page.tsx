export const dynamic = "force-dynamic";
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkItemStatusForm from "@/components/work-item-status-form"
import WorkItemEditForm from "@/components/work-item-edit-form"
import WorkItemMetaForm from "@/components/work-item-meta-form"
import WorkItemDangerZone from "@/components/work-item-danger-zone"
import WorkItemDocumentLinker from "@/components/work-item-document-linker"
import { WorkItemTaskSuggestions } from "@/components/work-item-task-suggestions"
import { WorkItemAIDescription } from "@/components/work-item-ai-description"
import { WorkItemTimeline } from "@/components/work-item-timeline"

type LinkedDocument = {
  linkId: string
  documentId: string
  title: string | null
  file_name: string | null
  file_url: string | null
  notes: string | null
  client_id: string | null
  created_at: Date | null
  updated_at: Date | null
}

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

  const linkedDocuments = await prisma.$queryRawUnsafe<LinkedDocument[]>(
    `
    select
      wid."id" as "linkId",
      wid."documentId"::text as "documentId",
      d.title,
      d.file_name,
      d.file_url,
      d.notes,
      d.client_id,
      d.created_at,
      d.updated_at
    from public."WorkItemDocument" wid
    join public.documents d
      on d.id = wid."documentId"
    where wid."workItemId" = $1
    order by wid."createdAt" desc
    `,
    id
  )

  const askAiHref = linkedDocuments.length
    ? `/in/ca/documents-ai?document_id=${encodeURIComponent(linkedDocuments[0].documentId)}`
    : `/in/ca/documents-ai${item.clientId ? `?client_id=${encodeURIComponent(item.clientId)}` : ""}`

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

        <div className="flex items-center gap-3">
          <Link
            href={askAiHref}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Ask AI
          </Link>

          <Link
            href="/workboard"
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back to Workboard
          </Link>
        </div>
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

<WorkItemAIDescription />

      <WorkItemTaskSuggestions />

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
            <h2 className="mb-3 text-lg font-semibold">Linked documents</h2>
            {linkedDocuments.length ? (
              <div className="space-y-3">
                {linkedDocuments.map((doc) => (
                  <div key={doc.linkId} className="rounded-lg border p-3">
                    <div className="font-medium">
                      {doc.title || doc.file_name || doc.documentId}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {doc.file_name || "No filename"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/in/ca/documents-ai?document_id=${encodeURIComponent(doc.documentId)}`}
                        className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                      >
                        Ask AI on this doc
                      </Link>
                      <Link
                        href={`/in/ca/documents/${encodeURIComponent(doc.documentId)}`}
                        className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                      >
                        Open document
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No linked documents yet.
              </div>
            )}
          </section>

          <WorkItemDocumentLinker
            workItemId={item.id}
            clientId={item.clientId}
          />

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

<WorkItemTimeline />
