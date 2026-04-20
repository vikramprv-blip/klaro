export const dynamic = "force-dynamic";
function formatCurrency(value: unknown) {
  if (value === null || value === undefined) return "—"
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : typeof value === "object" && value !== null && "toString" in value
          ? Number((value as { toString(): string }).toString())
          : NaN

  return Number.isFinite(num) ? `₹${num.toLocaleString("en-IN")}` : "—"
}

import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      workItems: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Client</p>
          <h1 className="text-3xl font-semibold tracking-tight">{client.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{client.email || "No email provided"}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Clients
          </Link>
          <Link
            href="/workboard"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Open Workboard
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{client.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-900">{client.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="text-slate-900">{client.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Company</dt>
              <dd className="text-slate-900">"—"</dd>
            </div>

          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Work Items</h2>

          {client.workItems.length === 0 ? (
            <p className="text-sm text-slate-500">No work items yet.</p>
          ) : (
            <div className="space-y-3">
              {client.workItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="mb-4 mt-8 text-lg font-semibold">Invoices</h2>

          {client.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {client.invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{`Invoice `}</h3>
                      <p className="mt-1 text-sm text-slate-600">{invoice.status}</p>
                    </div>
                    <div className="text-right text-sm font-medium text-slate-900">
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
