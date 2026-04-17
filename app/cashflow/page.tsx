
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

  return Number.isFinite(num) ? `₹${num.toLocaleString("en-IN")}` : String(value)
}

import { prisma } from "@/lib/prisma";
import AppTopbar from "@/components/layout/app-topbar";

export default async function CashflowPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      client: true,
      workItem: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totals = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === "DRAFT").length,
    sent: invoices.filter((i) => i.status === "SENT").length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    amount: invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppTopbar />

      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Cashflow</h1>
          <p className="text-sm text-zinc-500">
            Invoice pipeline from filed work items.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm text-zinc-500">Total Invoices</div>
            <div className="mt-2 text-2xl font-semibold">{totals.total}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm text-zinc-500">Draft</div>
            <div className="mt-2 text-2xl font-semibold">{totals.draft}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm text-zinc-500">Sent</div>
            <div className="mt-2 text-2xl font-semibold">{totals.sent}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm text-zinc-500">Paid</div>
            <div className="mt-2 text-2xl font-semibold">{totals.paid}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm text-zinc-500">Amount</div>
            <div className="mt-2 text-2xl font-semibold">{totals.amount}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Invoices</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Work Item</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Triggered</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t">
                      <td className="px-4 py-3">{invoice.client.name}</td>
                      <td className="px-4 py-3">{invoice.workItem.title}</td>
                      <td className="px-4 py-3">{invoice.status}</td>
                      <td className="px-4 py-3">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 py-3">
                        {invoice.triggeredAt
                          ? new Date(invoice.triggeredAt).toISOString().slice(0, 10)
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-zinc-400">
                      No invoices yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
