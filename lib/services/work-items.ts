import { prisma } from "@/lib/prisma";

export async function getWorkItems(filters?: {
  status?: string;
  clientId?: string;
}) {
  const where = {
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.clientId ? { clientId: filters.clientId } : {}),
  };

  return prisma.workItem.findMany({
    where,
    include: {
      client: true,
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getWorkItemById(id: string) {
  return prisma.workItem.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });
}

export async function updateWorkStatus(id: string, status: string) {
  const existing = await prisma.workItem.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Work item not found");
  }

  return prisma.workItem.update({
    where: { id },
    data: {
      status,
    },
    include: {
      client: true,
    },
  });
}
