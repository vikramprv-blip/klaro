export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.email !== process.env.ADMIN_EMAIL) {
    redirect("/in/ca");
  }

  const totalWorkspaces = await prisma.organization.count();

  const totalClients = await prisma.client.count();

  const totalTasks = await prisma.workItem.count();

  const freeWorkspaces = await prisma.organization.count({
    where: { plan: "free" },
  });

  const plans = await prisma.organization.groupBy({
    by: ["plan"],
    _count: true,
  });

  const recentWorkspaces = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Klaro Founder Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Workspaces</p>
          <p className="text-2xl font-bold">{totalWorkspaces}</p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Free users</p>
          <p className="text-2xl font-bold">{freeWorkspaces}</p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-2xl font-bold">{totalClients}</p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Tasks</p>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Plans</h2>
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.plan} className="flex justify-between text-sm">
              <span>{p.plan}</span>
              <span>{p._count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Recent workspaces</h2>
        <div className="space-y-2">
          {recentWorkspaces.map((org) => (
            <div key={org.id} className="flex justify-between text-sm border-b pb-2">
              <span>{org.email}</span>
              <span>{org.vertical} · {org.plan}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
