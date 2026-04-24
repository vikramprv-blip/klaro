import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CADashboard() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const tasks = await prisma.workItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: true },
  });

  const clients = await prisma.client.count();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your workspace</h1>

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

      <div>
        <h2 className="text-lg font-semibold mb-3">What to do today</h2>

        {tasks.length === 0 ? (
          <div className="border rounded-lg p-4 text-sm text-gray-500">
            No tasks yet.
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
    </main>
  );
}
