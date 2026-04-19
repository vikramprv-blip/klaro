export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"

export default async function CashflowPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
  const paidAmount = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
  const pendingAmount = invoices
    .filter((invoice) => invoice.status !== "PAID")
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cashflow</h1>
        <p className="text-sm text-gray-500">Invoice-level cash visibility</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Total Invoice Value</div>
          <div className="mt-2 text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Paid</div>
          <div className="mt-2 text-2xl font-bold">₹{paidAmount.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="mt-2 text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4 font-semibold">Invoices</div>

        {invoices.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">No invoices found.</div>
        ) : (
          <div className="divide-y">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{invoice.number}</div>
                    <div className="text-sm text-gray-500">
                      {invoice.client?.name || "No client"} • {invoice.status}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    ₹{(invoice.amount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
