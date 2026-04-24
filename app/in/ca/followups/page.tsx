import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CAFollowupsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    client?: string;
    type?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = (await searchParams) || {};

  const where: any = {};

  if (params.client) {
    where.workItem = {
      client: {
        name: {
          contains: params.client,
          mode: "insensitive",
        },
      },
    };
  }

  if (params.type) {
    where.workItem = {
      ...(where.workItem || {}),
      type: params.type,
    };
  }

  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) where.createdAt.gte = new Date(params.from);
    if (params.to) where.createdAt.lte = new Date(params.to);
  }

  const followups = await prisma.followUpLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      workItem: {
        include: {
          client: true,
        },
      },
    },
    take: 200,
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/in/ca" className="text-sm text-gray-500 hover:text-gray-900">
              ← Back to CA Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Compliance Follow-up History
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track who was contacted, for which task, and when.
            </p>
          </div>
        </div>

        <form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-5">
          <input
            name="client"
            placeholder="Client name"
            defaultValue={params.client || ""}
            className="rounded-xl border px-3 py-2 text-sm"
          />

          <select
            name="type"
            defaultValue={params.type || ""}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">All task types</option>
            <option value="GST">GST</option>
            <option value="TDS">TDS</option>
            <option value="ITR">ITR</option>
          </select>

          <input
            name="from"
            type="date"
            defaultValue={params.from || ""}
            className="rounded-xl border px-3 py-2 text-sm"
          />

          <input
            name="to"
            type="date"
            defaultValue={params.to || ""}
            className="rounded-xl border px-3 py-2 text-sm"
          />

          <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Filter
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {followups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    No follow-ups found.
                  </td>
                </tr>
              ) : (
                followups.map((f: any) => (
                  <tr key={f.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {f.workItem?.client?.name || "Unknown client"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.workItem?.type || f.workItem?.title || "Task"}
                    </td>
                    <td className="max-w-xl px-4 py-3 text-gray-700">
                      <div className="line-clamp-3 whitespace-pre-wrap">
                        {f.message || f.content || f.text || "No message saved"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(f.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
