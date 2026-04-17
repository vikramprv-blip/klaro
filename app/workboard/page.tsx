
import { WorkboardColumnCounts } from "@/components/workboard/workboard-column-counts"
import { useUsers } from "@/hooks/use-users"

import { WorkItemDueDateBadge } from "@/components/workboard/work-item-due-date-badge"

import { WORK_ITEM_VIEW_PRESETS } from "@/lib/work-item-view-presets"
import { WorkItemViewPresets } from "@/components/work-items/work-item-view-presets"
import { WorkItemActiveFilters } from "@/components/work-items/work-item-active-filters"
import { WorkItemsLoading, WorkItemsEmpty } from "@/components/work-items/work-item-states"
import { WorkItemFilters } from "@/components/work-items/work-item-filters"
import { buildWorkItemsQuery } from "@/lib/work-item-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { prisma } from "@/lib/prisma";
import WorkboardPage from "@/components/workboard/workboard-page";
import AppTopbar from "@/components/layout/app-topbar";
import { WorkboardBulkToolbar } from "@/components/workboard/workboard-bulk-toolbar"

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
