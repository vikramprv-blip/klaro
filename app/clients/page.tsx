import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AppTopbar from "@/components/layout/app-topbar";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      workItems: true,
      invoices: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppTopbar />

      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-zinc-500">
            Client-wise filings and invoice readiness.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Open Filings</th>
                  <th className="px-4 py-3 font-medium">Filed</th>
                  <th className="px-4 py-3 font-medium">Missing Docs</th>
                  <th className="px-4 py-3 font-medium">Invoices</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.length ? (
                  clients.map((client) => {
                    const openFilings = client.workItems.filter(
                      (w) => w.status !== "FILED"
                    ).length;

                    const filed = client.workItems.filter(
                      (w) => w.status === "FILED"
                    ).length;

                    const missingDocs = 0;

                    const invoices = client.invoices.length;

                    return (
                      <tr key={client.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{client.name}</div>
                          <div className="text-xs text-zinc-500">{client.email || "—"}</div>
                        </td>
                        <td className="px-4 py-3">{openFilings}</td>
                        <td className="px-4 py-3">{filed}</td>
                        <td className="px-4 py-3">{missingDocs}</td>
                        <td className="px-4 py-3">{invoices}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      No clients found.
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
