import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CADashboard() {
  const tasks = await prisma.workItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: true },
  });

  const clients = await prisma.client.count();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your workspace</h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-2xl font-bold">{clients}</p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Open tasks</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
      </div>

      {/* What to do today */}
      <div>
        <h2 className="text-lg font-semibold mb-3">What to do today</h2>

        {tasks.length === 0 ? (
          <div className="border rounded-lg p-4 text-sm text-gray-500">
            No tasks yet. Add a client to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="border rounded-lg p-4 flex justify-between">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-gray-500">
                    {t.client?.name || "No client"}
                  </p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <a href="/clients" className="border px-4 py-2 rounded-lg text-sm">
          + Add client
        </a>
        <a href="/documents" className="border px-4 py-2 rounded-lg text-sm">
          Upload document
        </a>
      </div>
    </main>
  );
}
