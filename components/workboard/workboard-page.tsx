"use client";

function buildReorderPayload(columns: Record<string, any[]>) {
  return Object.entries(columns).flatMap(([status, items]) =>
    items.map((item: any, index: number) => ({
      id: String(item.id),
      status,
      position: index,
    }))
  );
}

async function persistBoard(columns: Record<string, any[]>) {
  const res = await fetch("/api/work-items/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: buildReorderPayload(columns) }),
  });

  if (!res.ok) {
    throw new Error("Failed to save workboard state");
  }
}




async function persistWorkboardMove(id: string, nextStatus: string, nextPosition?: number) {
  const res = await fetch(`/api/workboard/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: nextStatus,
      
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to persist workboard move");
  }

  return res.json();
}

import { useMemo, useState  } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import WorkboardFilters from "./workboard-filters";
import WorkboardColumns from "./workboard-columns";
import NewWorkItemModal from "./new-work-item-modal";
import WorkItemDrawer from "./work-item-drawer";
import ToastStack, { ToastItem } from "@/components/ui/toast";

type WorkboardPageProps = {
  initialItems: any[];
  clients: any[];
  users: any[];
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["REVIEW"],
  REVIEW: ["IN_PROGRESS", "FILED"],
  FILED: [],
};

export default function WorkboardPage({
  initialItems,
  clients,
  users,
}: WorkboardPageProps) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState("all");
  const [openNew, setOpenNew] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.client.name.toLowerCase().includes(search.toLowerCase());

      const matchesClient = clientId === "all" || item.clientId === clientId;

      return matchesSearch && matchesClient;
    });
  }, [items, search, clientId]);

  function showToast(title: string, description?: string) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title, description }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2200);
  }

  function normalizeItem(item: any) {
    const owner =
      item.assignments?.find((a: any) => a.role === "OWNER" && !a.unassignedAt)?.user ??
      item.owner ??
      null;

    const docs = item.documents || [];
    const docsTotal = docs.length;
    const docsUploaded = docs.filter(
      (doc: any) => doc.status === "UPLOADED" || doc.status === "VERIFIED"
    ).length;

    return {
      ...item,
      owner,
      docsTotal,
      docsUploaded,
    };
  }

  function replaceItem(updatedRaw: any) {
    const updated = normalizeItem(updatedRaw);
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedItem((prev: any) => (prev?.id === updated.id ? updated : prev));
  }

  async function persistStatusChange(itemId: string, nextStatus: string, previousItems: any[]) {
    try {
      setSavingId(itemId);

      const res = await fetch(`/api/work-items/${itemId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      replaceItem(data.item);
      showToast("Status updated", `Moved to ${nextStatus}`);
    } catch {
      setItems(previousItems);
      showToast("Move failed", "Could not move item");
    } finally {
      setSavingId(null);
    }
  }

  function handleDragStart(event: any) {
    const item = event.active?.data?.current?.item;
    if (item) setActiveItem(item);
  }

  function handleDragCancel() {
    setActiveItem(null);
  }

  async function handleDragEnd(event: any) {
  const { active, over } = event || {};

  if (!active || !over) return;

  const activeId = String(active.id);
  const nextStatus =
    typeof over?.data?.current?.sortable?.containerId !== "undefined"
      ? String(over.data.current.sortable.containerId)
      : String(over.id);

  try {
    await persistWorkboardMove(activeId, nextStatus);
  } catch (error) {
    console.error(error);
  }
}

  return (
    <div className="flex h-full flex-col gap-5 p-6">
      <ToastStack toasts={toasts} />

      <motion.div layout className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Workboard</h1>
          <p className="text-sm text-zinc-500">
            Track filings, assignments, documents, and invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savingId ? (
            <div className="rounded-2xl border bg-white px-3 py-2 text-xs text-zinc-500 shadow-sm">
              Saving changes...
            </div>
          ) : null}

          <button
            onClick={() => setOpenNew(true)}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            New Work Item
          </button>
        </div>
      </motion.div>

      <motion.div layout className="rounded-3xl border bg-white/80 p-3 shadow-sm">
        <WorkboardFilters
          search={search}
          setSearch={setSearch}
          clientId={clientId}
          setClientId={setClientId}
          clients={clients}
        />
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <WorkboardColumns
          items={filteredItems}
          onSelectItem={(item) => setSelectedItem(item)}
        />

        <DragOverlay>
          {activeItem ? (
            <div className="w-[320px] rounded-3xl border bg-white p-4 shadow-2xl">
              <div className="text-sm font-semibold">{activeItem.title}</div>
              <div className="mt-1 text-xs text-zinc-500">{activeItem.client.name}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {openNew ? (
          <NewWorkItemModal
            open={openNew}
            onClose={() => setOpenNew(false)}
            clients={clients}
            users={users}
            onCreated={(item) => {
              setItems((prev) => [normalizeItem(item), ...prev]);
              showToast("Work item created");
            }}
          />
        ) : null}
      </AnimatePresence>

      <WorkItemDrawer
        open={!!selectedItem}
        item={selectedItem}
        users={users}
        onClose={() => setSelectedItem(null)}
        onUpdated={replaceItem}
        onToast={showToast}
      />
    </div>
  );
}
