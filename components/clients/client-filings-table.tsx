import { formatDate } from "@/lib/utils";

export default function ClientFilingsTable({ workItems }: { workItems: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Filings</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Docs</th>
              <th className="px-4 py-3 font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {workItems.length ? (
              workItems.map((item) => {
                const owner =
                  item.assignments?.find((a: any) => a.role === "OWNER" && !a.unassignedAt)?.user ||
                  null;

                const docsTotal = item.documents?.length || 0;
                const docsUploaded =
                  item.documents?.filter(
                    (d: any) => d.status === "UPLOADED" || d.status === "VERIFIED"
                  ).length || 0;

                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">{item.filingType}</td>
                    <td className="px-4 py-3">{item.periodLabel || "—"}</td>
                    <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{owner?.name || "Unassigned"}</td>
                    <td className="px-4 py-3">
                      {docsUploaded}/{docsTotal}
                    </td>
                    <td className="px-4 py-3">{item.invoice?.status || "—"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-4 py-6 text-zinc-400" colSpan={8}>
                  No filings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
