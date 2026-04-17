import { prisma } from "@/lib/prisma";
import WorkboardPage from "@/components/workboard/workboard-page";
import AppTopbar from "@/components/layout/app-topbar";

export default async function Workboard() {
  const [clients, users, items] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.workItem.findMany({
      include: {
        client: true,
        assignments: {
          where: { unassignedAt: null },
          include: { user: true },
        },
        documents: true,
        invoice: true,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const normalizedItems = items.map((item) => {
    const owner =
      item.assignments.find((a) => a.role === "OWNER")?.user ?? null;

    const docsTotal = item.documents.length;
    const docsUploaded = item.documents.filter(
      (doc) => doc.status === "UPLOADED" || doc.status === "VERIFIED"
    ).length;

    return {
      ...item,
      owner,
      docsTotal,
      docsUploaded,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppTopbar />
      <WorkboardPage
        initialItems={normalizedItems}
        clients={clients}
        users={users}
      />
    </div>
  );
}
