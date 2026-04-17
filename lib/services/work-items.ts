import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type WorkStatus = "PENDING" | "IN_PROGRESS" | "REVIEW" | "FILED";
type AssignmentRole = "OWNER" | "REVIEWER" | "SUPPORT";

export async function getWorkItems(filters?: {
  status?: WorkStatus;
  clientId?: string;
  assignedTo?: string;
  filingType?: string;
}) {
  const where: Prisma.WorkItemWhereInput = {
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.clientId ? { clientId: filters.clientId } : {}),
    ...(filters?.filingType ? { filingType: filters.filingType } : {}),
    ...(filters?.assignedTo
      ? {
          assignments: {
            some: {
              userId: filters.assignedTo,
              unassignedAt: null,
            },
          },
        }
      : {}),
  };

  const items = await prisma.workItem.findMany({
    where,
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
  });

  return items.map((item) => {
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
}

export async function getWorkItemById(id: string) {
  return prisma.workItem.findUnique({
    where: { id },
    include: {
      client: true,
      assignments: {
        where: { unassignedAt: null },
        include: { user: true },
      },
      documents: true,
      invoice: true,
      createdBy: true,
      reviewedBy: true,
    },
  });
}

export async function updateWorkStatus(id: string, status: WorkStatus) {
  const existing = await prisma.workItem.findUnique({
    where: { id },
    include: { invoice: true },
  });

  if (!existing) {
    throw new Error("Work item not found");
  }

  const allowedTransitions: Record<WorkStatus, WorkStatus[]> = {
    PENDING: ["IN_PROGRESS"],
    IN_PROGRESS: ["REVIEW"],
    REVIEW: ["FILED", "IN_PROGRESS"],
    FILED: [],
  };

  if (
    existing.status !== status &&
    !allowedTransitions[existing.status as WorkStatus].includes(status)
  ) {
    throw new Error(`Invalid status transition from ${existing.status} to ${status}`);
  }

  const updated = await prisma.workItem.update({
    where: { id },
    data: {
      status,
      ...(status === "FILED"
        ? {
            filedAt: new Date(),
            completedAt: new Date(),
            invoiceTriggered: true,
          }
        : {}),
    },
    include: {
      client: true,
      assignments: {
        where: { unassignedAt: null },
        include: { user: true },
      },
      documents: true,
      invoice: true,
    },
  });

  if (status === "FILED" && !existing.invoice) {
    await prisma.invoice.create({
      data: {
        clientId: existing.clientId,
        workItemId: existing.id,
        status: "DRAFT",
        triggeredAt: new Date(),
      },
    });
  }

  return updated;
}

export async function assignWorkItem(params: {
  workItemId: string;
  userId: string;
  role: AssignmentRole;
}) {
  const { workItemId, userId, role } = params;

  return prisma.$transaction(async (tx) => {
    if (role === "OWNER") {
      await tx.workAssignment.updateMany({
        where: {
          workItemId,
          role: "OWNER",
          unassignedAt: null,
        },
        data: {
          unassignedAt: new Date(),
        },
      });
    }

    await tx.workAssignment.create({
      data: {
        workItemId,
        userId,
        role,
      },
    });

    return tx.workItem.findUnique({
      where: { id: workItemId },
      include: {
        client: true,
        assignments: {
          where: { unassignedAt: null },
          include: { user: true },
        },
        documents: true,
        invoice: true,
      },
    });
  });
}
