export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const users = await prisma.organization.count();

  const plans = await prisma.organization.groupBy({
    by: ["plan"],
    _count: true,
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Klaro Admin</h1>

      <div className="border p-4 rounded-lg">
        <p className="text-sm text-gray-500">Total Workspaces</p>
        <p className="text-2xl font-bold">{users}</p>
      </div>

      <div className="border p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-2">Plans</p>
        {plans.map((p) => (
          <div key={p.plan} className="flex justify-between text-sm">
            <span>{p.plan}</span>
            <span>{p._count}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
